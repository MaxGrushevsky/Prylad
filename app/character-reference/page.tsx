'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import Layout from '@/components/Layout'
import StructuredData from '@/components/StructuredData'
import RelatedTools from '@/components/RelatedTools'
import { generateFAQSchema, generateHowToSchema, generateSoftwareApplicationSchema } from '@/lib/structured-data'
import { generateBreadcrumbs, getRelatedTools } from '@/lib/seo-helpers'

type Tab = 'ascii' | 'unicode' | 'emoji'

// ASCII types and functions
interface ASCIIChar {
  decimal: number
  hex: string
  octal: string
  binary: string
  char: string
  description: string
  category: string
}

function generateASCIITable(): ASCIIChar[] {
  const table: ASCIIChar[] = []
  const descriptions: Record<number, string> = {
    0: 'NUL (Null)', 1: 'SOH (Start of Heading)', 2: 'STX (Start of Text)', 3: 'ETX (End of Text)',
    4: 'EOT (End of Transmission)', 5: 'ENQ (Enquiry)', 6: 'ACK (Acknowledge)', 7: 'BEL (Bell)',
    8: 'BS (Backspace)', 9: 'TAB (Horizontal Tab)', 10: 'LF (Line Feed)', 11: 'VT (Vertical Tab)',
    12: 'FF (Form Feed)', 13: 'CR (Carriage Return)', 14: 'SO (Shift Out)', 15: 'SI (Shift In)',
    16: 'DLE (Data Link Escape)', 17: 'DC1 (Device Control 1)', 18: 'DC2 (Device Control 2)',
    19: 'DC3 (Device Control 3)', 20: 'DC4 (Device Control 4)', 21: 'NAK (Negative Acknowledge)',
    22: 'SYN (Synchronous Idle)', 23: 'ETB (End of Transmission Block)', 24: 'CAN (Cancel)',
    25: 'EM (End of Medium)', 26: 'SUB (Substitute)', 27: 'ESC (Escape)', 28: 'FS (File Separator)',
    29: 'GS (Group Separator)', 30: 'RS (Record Separator)', 31: 'US (Unit Separator)',
    32: 'Space', 127: 'DEL (Delete)'
  }
  const getCategory = (code: number): string => {
    if (code === 0 || (code >= 1 && code <= 31) || code === 127) return 'Control'
    if (code === 32) return 'Whitespace'
    if ((code >= 33 && code <= 47) || (code >= 58 && code <= 64) || (code >= 91 && code <= 96) || (code >= 123 && code <= 126)) return 'Punctuation'
    if (code >= 48 && code <= 57) return 'Digit'
    if (code >= 65 && code <= 90) return 'Uppercase'
    if (code >= 97 && code <= 122) return 'Lowercase'
    return 'Unknown'
  }
  for (let i = 0; i <= 127; i++) {
    const char = i === 127 ? 'DEL' : (i < 32 ? descriptions[i] || `Ctrl-${String.fromCharCode(i + 64)}` : String.fromCharCode(i))
    const displayChar = i < 32 || i === 127 ? '' : String.fromCharCode(i)
    table.push({
      decimal: i,
      hex: i.toString(16).toUpperCase().padStart(2, '0'),
      octal: i.toString(8).padStart(3, '0'),
      binary: i.toString(2).padStart(7, '0'),
      char: displayChar,
      description: descriptions[i] || (i >= 33 && i <= 126 ? `Character: ${displayChar}` : `Control character`),
      category: getCategory(i)
    })
  }
  return table
}

// Unicode types and functions
interface UnicodeInfo {
  char: string
  codePoint: number
  name: string
  category: string
  block: string
  htmlEntity: string
  cssEscape: string
  jsEscape: string
  utf8: string
  description: string
}

function getUnicodeInfo(char: string): UnicodeInfo | null {
  if (!char || char.length === 0) return null
  const codePoint = char.codePointAt(0)!
  const name = getUnicodeName(char)
  const category = getUnicodeCategory(char)
  const block = getUnicodeBlock(codePoint)
  const htmlEntity = `&#${codePoint};`
  const cssEscape = `\\${codePoint.toString(16).toUpperCase().padStart(6, '0')}`
  const jsEscape = codePoint <= 0xFFFF 
    ? `\\u${codePoint.toString(16).toUpperCase().padStart(4, '0')}`
    : `\\u{${codePoint.toString(16).toUpperCase()}}`
  const utf8 = getUTF8Bytes(char)
  return { char, codePoint, name, category, block, htmlEntity, cssEscape, jsEscape, utf8, description: `${name} (${category})` }
}

function getUnicodeName(char: string): string {
  try {
    const codePoint = char.codePointAt(0)!
    if (codePoint < 32) {
      const controlNames: Record<number, string> = {
        0: 'NULL', 1: 'START OF HEADING', 2: 'START OF TEXT', 3: 'END OF TEXT',
        4: 'END OF TRANSMISSION', 5: 'ENQUIRY', 6: 'ACKNOWLEDGE', 7: 'BELL',
        8: 'BACKSPACE', 9: 'CHARACTER TABULATION', 10: 'LINE FEED', 11: 'LINE TABULATION',
        12: 'FORM FEED', 13: 'CARRIAGE RETURN', 14: 'SHIFT OUT', 15: 'SHIFT IN',
        16: 'DATA LINK ESCAPE', 17: 'DEVICE CONTROL ONE', 18: 'DEVICE CONTROL TWO',
        19: 'DEVICE CONTROL THREE', 20: 'DEVICE CONTROL FOUR', 21: 'NEGATIVE ACKNOWLEDGE',
        22: 'SYNCHRONOUS IDLE', 23: 'END OF TRANSMISSION BLOCK', 24: 'CANCEL',
        25: 'END OF MEDIUM', 26: 'SUBSTITUTE', 27: 'ESCAPE', 28: 'INFORMATION SEPARATOR FOUR',
        29: 'INFORMATION SEPARATOR THREE', 30: 'INFORMATION SEPARATOR TWO', 31: 'INFORMATION SEPARATOR ONE'
      }
      return controlNames[codePoint] || `U+${codePoint.toString(16).toUpperCase().padStart(4, '0')}`
    }
    if (codePoint === 32) return 'SPACE'
    if (codePoint === 127) return 'DELETE'
    return `U+${codePoint.toString(16).toUpperCase().padStart(4, '0')}`
  } catch {
    const codePoint = char.codePointAt(0)!
    return `U+${codePoint.toString(16).toUpperCase().padStart(4, '0')}`
  }
}

function getUnicodeCategory(char: string): string {
  const codePoint = char.codePointAt(0)!
  if (codePoint < 32 || codePoint === 127) return 'Control'
  if (codePoint === 32) return 'Space'
  if (codePoint >= 33 && codePoint <= 47) return 'Punctuation'
  if (codePoint >= 48 && codePoint <= 57) return 'Digit'
  if (codePoint >= 58 && codePoint <= 64) return 'Punctuation'
  if (codePoint >= 65 && codePoint <= 90) return 'Uppercase Letter'
  if (codePoint >= 91 && codePoint <= 96) return 'Punctuation'
  if (codePoint >= 97 && codePoint <= 122) return 'Lowercase Letter'
  if (codePoint >= 123 && codePoint <= 126) return 'Punctuation'
  if (codePoint >= 0x1F300 && codePoint <= 0x1F9FF) return 'Emoji'
  return 'Other'
}

function getUnicodeBlock(codePoint: number): string {
  if (codePoint < 128) return 'Basic Latin'
  if (codePoint < 256) return 'Latin-1 Supplement'
  if (codePoint >= 0x1F300 && codePoint <= 0x1F9FF) return 'Emoji'
  return 'Other'
}

function getUTF8Bytes(char: string): string {
  const bytes: number[] = []
  for (let i = 0; i < char.length; i++) {
    const code = char.charCodeAt(i)
    if (code < 0x80) {
      bytes.push(code)
    } else if (code < 0x800) {
      bytes.push(0xC0 | (code >> 6))
      bytes.push(0x80 | (code & 0x3F))
    } else if (code < 0xD800 || code >= 0xE000) {
      bytes.push(0xE0 | (code >> 12))
      bytes.push(0x80 | ((code >> 6) & 0x3F))
      bytes.push(0x80 | (code & 0x3F))
    }
  }
  return bytes.map(b => b.toString(16).toUpperCase().padStart(2, '0')).join(' ')
}

// Emoji types
interface EmojiCategory {
  name: string
  icon: string
  emojis: string[]
}

const emojiCategories: EmojiCategory[] = [
  { name: 'Smileys & Emotion', icon: '😀', emojis: ['😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '🙃', '😉', '😊', '😇', '🥰', '😍', '🤩', '😘', '😗', '😚', '😙', '😋', '😛', '😜', '🤪', '😝', '🤑', '🤗', '🤭', '🤫', '🤔', '🤐', '🤨', '😐', '😑', '😶', '😏', '😒', '🙄', '😬', '🤥', '😌', '😔', '😪', '🤤', '😴', '😷', '🤒', '🤕', '🤢', '🤮', '🤧', '🥵', '🥶', '😵', '🤯', '🤠', '🥳', '😎', '🤓', '🧐', '😕', '😟', '🙁', '☹️', '😮', '😯', '😲', '😳', '🥺', '😦', '😧', '😨', '😰', '😥', '😢', '😭', '😱', '😖', '😣', '😞', '😓', '😩', '😫', '🥱', '😤', '😡', '😠', '🤬', '😈', '👿', '💀', '☠️', '💩', '🤡', '👹', '👺', '👻', '👽', '👾', '🤖'] },
  { name: 'People & Body', icon: '👋', emojis: ['👋', '🤚', '🖐️', '✋', '🖖', '👌', '🤌', '🤏', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '🖕', '👇', '☝️', '👍', '👎', '✊', '👊', '🤛', '🤜', '👏', '🙌', '👐', '🤲', '🤝', '🙏', '✍️', '💪', '🦾', '🦿', '🦵', '🦶', '👂', '🦻', '👃', '🧠', '🫀', '🫁', '🦷', '🦴', '👀', '👁️', '👅', '👄', '💋', '🩸', '👶', '🧒', '👦', '👧', '🧑', '👱', '👨', '🧔', '👩', '🧓', '👴', '👵'] },
  { name: 'Animals & Nature', icon: '🐶', emojis: ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐻‍❄️', '🐨', '🐯', '🦁', '🐮', '🐷', '🐽', '🐸', '🐵', '🙈', '🙉', '🙊', '🐒', '🐔', '🐧', '🐦', '🐤', '🐣', '🐥', '🦆', '🦅', '🦉', '🦇', '🐺', '🐗', '🐴', '🦄', '🐝', '🐛', '🦋', '🐌', '🐞', '🐜', '🦟', '🦗', '🕷️', '🕸️', '🦂', '🐢', '🐍', '🦎', '🦖', '🦕', '🐙', '🦑', '🦐', '🦞', '🦀', '🐡', '🐠', '🐟', '🐬', '🐳', '🐋', '🦈', '🐊', '🐅', '🐆', '🦓', '🦍', '🦧', '🐘', '🦛', '🦏', '🐪', '🐫', '🦒', '🦘', '🦬', '🐃', '🐂', '🐄', '🐎', '🐖', '🐏', '🐑', '🦙', '🐐', '🦌', '🐕', '🐩', '🦮', '🐕‍🦺', '🐈', '🐈‍⬛', '🪶', '🐓', '🦃', '🦤', '🦚', '🦜', '🦢', '🦩', '🕊️', '🐇', '🦝', '🦨', '🦡', '🦫', '🦦', '🦥', '🐁', '🐀', '🐿️', '🦔', '🐾', '🐉', '🐲', '🌵', '🎄', '🎋', '🎍', '🍀', '🍁', '🍂', '🍃'] },
  { name: 'Food & Drink', icon: '🍕', emojis: ['🍇', '🍈', '🍉', '🍊', '🍋', '🍌', '🍍', '🥭', '🍎', '🍏', '🍐', '🍑', '🍒', '🍓', '🫐', '🥝', '🍅', '🫒', '🥥', '🥑', '🍆', '🥔', '🥕', '🌽', '🌶️', '🫑', '🥒', '🥬', '🥦', '🧄', '🧅', '🍄', '🥜', '🌰', '🍞', '🥐', '🥖', '🫓', '🥨', '🥯', '🥞', '🧇', '🥓', '🥩', '🍗', '🍖', '🦴', '🌭', '🍔', '🍟', '🍕', '🫔', '🥪', '🥙', '🧆', '🌮', '🌯', '🥗', '🥘', '🥫', '🫕', '🍝', '🍜', '🍲', '🍛', '🍣', '🍱', '🥟', '🦪', '🍤', '🍙', '🍚', '🍘', '🍥', '🥠', '🥮', '🍢', '🍡', '🍧', '🍨', '🍦', '🥧', '🧁', '🍰', '🎂', '🍮', '🍭', '🍬', '🍫', '🍿', '🍩', '🍪', '🍯', '🥛', '🍼', '🫖', '☕️', '🍵', '🧃', '🥤', '🧋', '🍶', '🍺', '🍻', '🥂', '🍷', '🥃', '🍸', '🍹', '🧉', '🍾', '🧊'] },
  { name: 'Travel & Places', icon: '✈️', emojis: ['🚗', '🚕', '🚙', '🚌', '🚎', '🏎️', '🚓', '🚑', '🚒', '🚐', '🛻', '🚚', '🚛', '🚜', '🏍️', '🛵', '🦽', '🦼', '🛴', '🚲', '🛴', '🛹', '🛼', '🚁', '🛸', '✈️', '🛩️', '🛫', '🛬', '🪂', '💺', '🚀', '🚂', '🚃', '🚄', '🚅', '🚆', '🚇', '🚈', '🚉', '🚊', '🚝', '🚞', '🚟', '🚠', '🚡', '🛰️', '⛵️', '🛶', '🚤', '🛥️', '🛳️', '⛴️', '🚢', '⚓️', '⛽️', '🚧', '🚦', '🚥', '🗺️', '🗿', '🗽', '🗼', '🏰', '🏯', '🏟️', '🎡', '🎢', '🎠', '⛲', '⛱️', '🏖️', '🏝️', '🏜️', '🌋', '⛰️', '🏔️', '🗻', '🏕️', '⛺️', '🛖', '🏠', '🏡', '🏘️', '🏚️', '🏗️', '🏭', '🏢', '🏬', '🏣', '🏤', '🏥', '🏦', '🏨', '🏪', '🏫', '🏩', '💒', '🏛️', '⛪️', '🕌', '🕍', '🛕', '🕋', '⛩️', '🛤️', '🛣️', '🗾', '🎑', '🏞️', '🌅', '🌄', '🌠', '🎇', '🎆', '🌇', '🌆', '🏙️', '🌃', '🌌', '🌉', '🌁'] },
  { name: 'Activities', icon: '⚽', emojis: ['⚽', '🏀', '🏈', '⚾', '🥎', '🎾', '🏐', '🏉', '🥏', '🎱', '🏓', '🏸', '🏒', '🏑', '🥍', '🏏', '🥅', '⛳', '🏹', '🎣', '🤿', '🥊', '🥋', '🎽', '🛹', '🛷', '⛸️', '🥌', '🎿', '⛷️', '🏂', '🪂', '🏋️', '🤼', '🤸', '⛹️', '🤺', '🤾', '🏌️', '🏇', '🧘', '🏄', '🏊', '🤽', '🚣', '🧗', '🚵', '🚴', '🏆', '🥇', '🥈', '🥉', '🏅', '🎖️', '🏵️', '🎗️', '🎫', '🎟️', '🎪', '🤹', '🎭', '🩰', '🎨', '🎬', '🎤', '🎧', '🎼', '🎹', '🥁', '🎷', '🎺', '🎸', '🪕', '🎻', '🎲', '♟️', '🎯', '🎳', '🎮', '🎰', '🧩'] },
  { name: 'Objects', icon: '⌚', emojis: ['⌚', '📱', '📲', '💻', '⌨️', '🖥️', '🖨️', '🖱️', '🖲️', '🕹️', '🗜️', '💾', '💿', '📀', '📼', '📷', '📸', '📹', '🎥', '📽️', '🎞️', '📞', '☎️', '📟', '📠', '📺', '📻', '🎙️', '🎚️', '🎛️', '🧭', '⏱️', '⏲️', '⏰', '🕰️', '⌛', '⏳', '📡', '🔋', '🔌', '💡', '🔦', '🕯️', '🧯', '🪔', '🧲', '🪑', '🧳', '🛍️', '🛒', '🎁', '🎈', '🎏', '🎀', '🪄', '🪅', '🎊', '🎉', '🎎', '🏮', '🎐', '🧧', '✉️', '📩', '📨', '📧', '💌', '📥', '📤', '📦', '🏷️', '🪧', '📪', '📫', '📬', '📭', '📮', '📯', '📜', '📃', '📄', '📑', '🧾', '📊', '📈', '📉', '🗒️', '🗓️', '📆', '📅', '🗑️', '📇', '🗃️', '🗳️', '🗄️', '📋', '📁', '📂', '🗂️'] },
  { name: 'Symbols', icon: '❤️', emojis: ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '☮️', '✝️', '☪️', '🕉️', '☸️', '✡️', '🔯', '🕎', '☯️', '☦️', '🛐', '⛎', '♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓', '🆔', '⚛️', '🉑', '☢️', '☣️', '📴', '📳', '🈶', '🈚', '🈸', '🈺', '🈷️', '✴️', '🆚', '💮', '🉐', '㊙️', '㊗️', '🈴', '🈵', '🈹', '🈲', '🅰️', '🅱️', '🆎', '🆑', '🅾️', '🆘', '❌', '⭕', '🛑', '⛔', '📛', '🚫', '💯', '💢', '♨️', '🚷', '🚯', '🚳', '🚱', '🔞', '📵', '🚭', '❗', '❓', '❕', '❔', '‼️', '⁉️', '🔅', '🔆', '〽️', '⚠️', '🚸', '🔱', '⚜️', '🔰', '♻️', '✅', '🈯', '💹', '❇️', '✳️', '❎', '🌐', '💠', 'Ⓜ️', '🌀', '💤', '🏧', '🚾', '♿', '🅿️', '🈳', '🈂️', '🛂', '🛃', '🛄', '🛅', '🚹', '🚺', '🚼', '🚻', '🚮', '🎦', '📶', '🈁', '🔣', 'ℹ️', '🔤', '🔡', '🔠', '🆖', '🆗', '🆙', '🆒', '🆕', '🆓', '0️⃣', '1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟', '🔢', '#️⃣', '*️⃣', '▶️', '⏸️', '⏯️', '⏹️', '⏺️', '⏭️', '⏮️', '⏩', '⏪', '⏫', '⏬', '◀️', '🔼', '🔽', '➡️', '⬅️', '⬆️', '⬇️', '↗️', '↘️', '↙️', '↖️', '↕️', '↔️', '↪️', '↩️', '⤴️', '⤵️', '🔀', '🔁', '🔂', '🔄', '🔃', '🎵', '🎶', '➕', '➖', '➗', '✖️', '💲', '💱', '™️', '©️', '®️', '〰️', '➰', '➿', '🔚', '🔙', '🔛', '🔜', '🔝', '✔️', '☑️', '🔘', '🔴', '🟠', '🟡', '🟢', '🔵', '🟣', '⚫', '⚪', '🟤', '🔶', '🔷', '🔸', '🔹', '🔺', '🔻', '💠', '🔘', '🔳', '🔲', '▪️', '▫️', '◾', '◽', '◼️', '◻️', '🟥', '🟧', '🟨', '🟩', '🟦', '🟪', '⬛', '⬜', '🟫', '🔈', '🔇', '🔉', '🔊', '🔔', '🔕', '📣', '📢', '👁️‍🗨️', '💬', '💭', '🗯️', '♠️', '♣️', '♥️', '♦️', '🃏', '🎴', '🀄', '🕐', '🕑', '🕒', '🕓', '🕔', '🕕', '🕖', '🕗', '🕘', '🕙', '🕚', '🕛', '🕜', '🕝', '🕞', '🕟', '🕠', '🕡', '🕢', '🕣', '🕤', '🕥', '🕦', '🕧'] },
  { name: 'Flags', icon: '🏳️', emojis: ['🏳️', '🏴', '🏁', '🚩', '🏳️‍🌈', '🏳️‍⚧️', '🏴‍☠️', '🇦🇨', '🇦🇩', '🇦🇪', '🇦🇫', '🇦🇬', '🇦🇮', '🇦🇱', '🇦🇲', '🇦🇴', '🇦🇶', '🇦🇷', '🇦🇸', '🇦🇹', '🇦🇺', '🇦🇼', '🇦🇽', '🇦🇿', '🇧🇦', '🇧🇧', '🇧🇩', '🇧🇪', '🇧🇫', '🇧🇬', '🇧🇭', '🇧🇮', '🇧🇯', '🇧🇱', '🇧🇲', '🇧🇳', '🇧🇴', '🇧🇶', '🇧🇷', '🇧🇸', '🇧🇹', '🇧🇻', '🇧🇼', '🇧🇾', '🇧🇿', '🇨🇦', '🇨🇨', '🇨🇩', '🇨🇫', '🇨🇬', '🇨🇭', '🇨🇮', '🇨🇰', '🇨🇱', '🇨🇲', '🇨🇳', '🇨🇴', '🇨🇵', '🇨🇷', '🇨🇺', '🇨🇻', '🇨🇼', '🇨🇽', '🇨🇾', '🇨🇿', '🇩🇪', '🇩🇬', '🇩🇯', '🇩🇰', '🇩🇲', '🇩🇴', '🇩🇿', '🇪🇦', '🇪🇨', '🇪🇪', '🇪🇬', '🇪🇭', '🇪🇷', '🇪🇸', '🇪🇹', '🇪🇺', '🇫🇮', '🇫🇯', '🇫🇰', '🇫🇲', '🇫🇴', '🇫🇷', '🇬🇦', '🇬🇧', '🇬🇩', '🇬🇪', '🇬🇫', '🇬🇬', '🇬🇭', '🇬🇮', '🇬🇱', '🇬🇲', '🇬🇳', '🇬🇵', '🇬🇶', '🇬🇷', '🇬🇸', '🇬🇹', '🇬🇺', '🇬🇼', '🇬🇾', '🇭🇰', '🇭🇲', '🇭🇳', '🇭🇷', '🇭🇹', '🇭🇺', '🇮🇨', '🇮🇩', '🇮🇪', '🇮🇱', '🇮🇲', '🇮🇳', '🇮🇴', '🇮🇶', '🇮🇷', '🇮🇸', '🇮🇹', '🇯🇪', '🇯🇲', '🇯🇴', '🇯🇵', '🇰🇪', '🇰🇬', '🇰🇭', '🇰🇮', '🇰🇲', '🇰🇳', '🇰🇵', '🇰🇷', '🇰🇼', '🇰🇾', '🇰🇿', '🇱🇦', '🇱🇧', '🇱🇨', '🇱🇮', '🇱🇰', '🇱🇷', '🇱🇸', '🇱🇹', '🇱🇺', '🇱🇻', '🇱🇾', '🇲🇦', '🇲🇨', '🇲🇩', '🇲🇪', '🇲🇫', '🇲🇬', '🇲🇭', '🇲🇰', '🇲🇱', '🇲🇲', '🇲🇳', '🇲🇴', '🇲🇵', '🇲🇶', '🇲🇷', '🇲🇸', '🇲🇹', '🇲🇺', '🇲🇻', '🇲🇼', '🇲🇽', '🇲🇾', '🇲🇿', '🇳🇦', '🇳🇨', '🇳🇪', '🇳🇫', '🇳🇬', '🇳🇮', '🇳🇱', '🇳🇴', '🇳🇵', '🇳🇷', '🇳🇺', '🇳🇿', '🇴🇲', '🇵🇦', '🇵🇪', '🇵🇫', '🇵🇬', '🇵🇭', '🇵🇰', '🇵🇱', '🇵🇲', '🇵🇳', '🇵🇷', '🇵🇸', '🇵🇹', '🇵🇼', '🇵🇾', '🇶🇦', '🇷🇪', '🇷🇴', '🇷🇸', '🇷🇺', '🇷🇼', '🇸🇦', '🇸🇧', '🇸🇨', '🇸🇩', '🇸🇪', '🇸🇬', '🇸🇭', '🇸🇮', '🇸🇯', '🇸🇰', '🇸🇱', '🇸🇲', '🇸🇳', '🇸🇴', '🇸🇷', '🇸🇸', '🇸🇹', '🇸🇻', '🇸🇽', '🇸🇾', '🇸🇿', '🇹🇦', '🇹🇨', '🇹🇩', '🇹🇫', '🇹🇬', '🇹🇭', '🇹🇯', '🇹🇰', '🇹🇱', '🇹🇲', '🇹🇳', '🇹🇴', '🇹🇷', '🇹🇹', '🇹🇻', '🇹🇼', '🇹🇿', '🇺🇦', '🇺🇬', '🇺🇲', '🇺🇳', '🇺🇸', '🇺🇾', '🇺🇿', '🇻🇦', '🇻🇨', '🇻🇪', '🇻🇬', '🇻🇮', '🇻🇳', '🇻🇺', '🇼🇫', '🇼🇸', '🇽🇰', '🇾🇪', '🇾🇹', '🇿🇦', '🇿🇲', '🇿🇼', '🏴󠁧󠁢󠁥󠁮󠁧󠁿', '🏴󠁧󠁢󠁳󠁣󠁴󠁿', '🏴󠁧󠁢󠁷󠁬󠁳󠁿'] }
]

export default function CharacterReferencePage() {
  const [activeTab, setActiveTab] = useState<Tab>('ascii')

  // Check URL hash for tab switching
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash
      if (hash === '#unicode') {
        setActiveTab('unicode')
      } else if (hash === '#emoji') {
        setActiveTab('emoji')
      } else if (hash === '#ascii') {
        setActiveTab('ascii')
      }
    }
  }, [])

  // Update URL hash when tab changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hash = activeTab === 'ascii' ? '' : activeTab === 'unicode' ? '#unicode' : '#emoji'
      if (window.location.hash !== hash) {
        window.history.replaceState(null, '', hash || window.location.pathname)
      }
    }
  }, [activeTab])

  // ========== ASCII STATE ==========
  const [asciiSearchQuery, setAsciiSearchQuery] = useState('')
  const [asciiSelectedCategory, setAsciiSelectedCategory] = useState<string>('all')
  const [asciiCopiedIndex, setAsciiCopiedIndex] = useState<number | null>(null)
  const [asciiViewMode, setAsciiViewMode] = useState<'table' | 'grid'>('table')

  const asciiTable = useMemo(() => generateASCIITable(), [])
  const asciiCategories = useMemo(() => {
    const cats = new Set(asciiTable.map(item => item.category))
    return Array.from(cats).sort()
  }, [asciiTable])

  const filteredAsciiTable = useMemo(() => {
    let filtered = asciiTable
    if (asciiSelectedCategory !== 'all') {
      filtered = filtered.filter(item => item.category === asciiSelectedCategory)
    }
    if (asciiSearchQuery.trim()) {
      const query = asciiSearchQuery.toLowerCase()
      filtered = filtered.filter(item => 
        item.decimal.toString().includes(query) ||
        item.hex.toLowerCase().includes(query) ||
        item.octal.includes(query) ||
        item.binary.includes(query) ||
        item.char.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query)
      )
    }
    return filtered
  }, [asciiTable, asciiSelectedCategory, asciiSearchQuery])

  const copyAsciiToClipboard = useCallback(async (text: string, index: number) => {
    try {
      await navigator.clipboard.writeText(text)
      setAsciiCopiedIndex(index)
      setTimeout(() => setAsciiCopiedIndex(null), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }, [])

  const exportAsciiToCSV = () => {
    const headers = ['Decimal', 'Hex', 'Octal', 'Binary', 'Character', 'Description', 'Category']
    const rows = filteredAsciiTable.map(item => [
      item.decimal.toString(),
      item.hex,
      item.octal,
      item.binary,
      item.char || '',
      item.description,
      item.category
    ])
    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(','))
    ].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'ascii-table.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  const exportAsciiToJSON = () => {
    const json = JSON.stringify(filteredAsciiTable, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'ascii-table.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  // ========== UNICODE STATE ==========
  const [unicodeInput, setUnicodeInput] = useState('')
  const [unicodeSearchQuery, setUnicodeSearchQuery] = useState('')
  const [unicodeCopiedIndex, setUnicodeCopiedIndex] = useState<number | null>(null)
  const [unicodeSearchResults, setUnicodeSearchResults] = useState<UnicodeInfo[]>([])

  const unicodeCharInfo = useMemo(() => {
    if (!unicodeInput || unicodeInput.length === 0) return null
    return getUnicodeInfo(unicodeInput[0])
  }, [unicodeInput])

  const handleUnicodeSearch = useCallback(() => {
    if (!unicodeSearchQuery.trim()) {
      setUnicodeSearchResults([])
      return
    }
    const results: UnicodeInfo[] = []
    const query = unicodeSearchQuery.toLowerCase()
    if (query.startsWith('u+') || query.startsWith('0x') || /^\d+$/.test(query)) {
      let codePoint: number
      if (query.startsWith('u+')) {
        codePoint = parseInt(query.slice(2), 16)
      } else if (query.startsWith('0x')) {
        codePoint = parseInt(query.slice(2), 16)
      } else {
        codePoint = parseInt(query, 10)
      }
      if (codePoint >= 0 && codePoint <= 0x10FFFF) {
        try {
          const char = String.fromCodePoint(codePoint)
          const info = getUnicodeInfo(char)
          if (info) results.push(info)
        } catch {}
      }
    } else {
      for (let i = 0; i <= 0x10FFFF && results.length < 100; i++) {
        try {
          const char = String.fromCodePoint(i)
          const info = getUnicodeInfo(char)
          if (info && (
            info.name.toLowerCase().includes(query) ||
            info.char === unicodeSearchQuery ||
            info.category.toLowerCase().includes(query) ||
            info.block.toLowerCase().includes(query)
          )) {
            results.push(info)
          }
        } catch {}
      }
    }
    setUnicodeSearchResults(results.slice(0, 50))
  }, [unicodeSearchQuery])

  const copyUnicodeToClipboard = useCallback(async (text: string, index: number) => {
    try {
      await navigator.clipboard.writeText(text)
      setUnicodeCopiedIndex(index)
      setTimeout(() => setUnicodeCopiedIndex(null), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }, [])

  // ========== EMOJI STATE ==========
  const [emojiSearchQuery, setEmojiSearchQuery] = useState('')
  const [emojiSelectedCategory, setEmojiSelectedCategory] = useState<string | null>(null)
  const [emojiCopiedEmoji, setEmojiCopiedEmoji] = useState<string | null>(null)
  const [emojiRecentEmojis, setEmojiRecentEmojis] = useState<string[]>([])

  const filteredEmojiCategories = useMemo(() => {
    if (!emojiSearchQuery.trim()) return emojiCategories
    const query = emojiSearchQuery.toLowerCase()
    return emojiCategories
      .map(cat => ({
        ...cat,
        emojis: cat.emojis.filter(emoji => {
          return emoji.includes(query) || cat.name.toLowerCase().includes(query)
        })
      }))
      .filter(cat => cat.emojis.length > 0)
  }, [emojiSearchQuery])

  const copyEmojiToClipboard = useCallback(async (emoji: string) => {
    try {
      await navigator.clipboard.writeText(emoji)
      setEmojiCopiedEmoji(emoji)
      setTimeout(() => setEmojiCopiedEmoji(null), 2000)
      setEmojiRecentEmojis(prev => {
        const filtered = prev.filter(e => e !== emoji)
        return [emoji, ...filtered].slice(0, 20)
      })
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }, [])

  // SEO data
  const toolPath = '/character-reference'
  const toolName = 'Character Reference'
  const category = 'text'
  const breadcrumbs = generateBreadcrumbs(toolName, toolPath, category)
  const relatedTools = getRelatedTools(toolPath, category, 6)

  const faqs = [
    {
      question: "What is Character Reference?",
      answer: "Character Reference is an all-in-one tool that combines ASCII table, Unicode lookup, and emoji picker. It helps you find character codes, look up Unicode information, and browse emojis all in one place."
    },
    {
      question: "How do I use the ASCII table?",
      answer: "Browse the complete ASCII table (0-127) with decimal, hexadecimal, octal, and binary representations. Search by code, character, or description. Click any value to copy it to your clipboard."
    },
    {
      question: "How do I lookup Unicode characters?",
      answer: "Enter a character in the input field to see its Unicode information, or search by code point (U+0041, 0x41, or 65), character name, category, or block. The tool displays code point, HTML entity, CSS escape, JavaScript escape, and UTF-8 bytes."
    },
    {
      question: "How do I use the emoji picker?",
      answer: "Browse emojis by category using the category tabs, or use the search box to find specific emojis. Click on any emoji to copy it to your clipboard. Recently used emojis appear at the top for quick access."
    }
  ]

  const howToSteps = [
    {
      name: "Choose a Tab",
      text: "Select between ASCII Table, Unicode Lookup, or Emoji Picker using the tabs at the top."
    },
    {
      name: "ASCII Table",
      text: "View all 128 ASCII characters with their codes. Filter by category, search, and export as CSV or JSON."
    },
    {
      name: "Unicode Lookup",
      text: "Enter a character or search by code point to get detailed Unicode information including escape sequences."
    },
    {
      name: "Emoji Picker",
      text: "Browse emojis by category or search. Click to copy and use in your messages, social media, or documents."
    }
  ]

  const structuredData = [
    generateFAQSchema(faqs),
    generateHowToSchema(
      "How to Use Character Reference",
      "Learn how to use our free character reference tool to find ASCII codes, lookup Unicode characters, and browse emojis.",
      howToSteps,
      "PT3M"
    ),
    generateSoftwareApplicationSchema(
      "Character Reference",
      "Free online character reference tool. ASCII table with decimal/hex/octal/binary, Unicode character lookup with code points and escape sequences, and emoji picker with categories.",
      "https://prylad.pro/character-reference",
      "WebApplication"
    )
  ]

  return (
    <>
      <StructuredData data={structuredData} />
      <Layout
        title="🔤 Character Reference - ASCII Table, Unicode Lookup & Emoji Picker"
        description="All-in-one character reference tool: ASCII table with decimal/hex/octal/binary, Unicode character lookup with code points and escape sequences, and emoji picker with categories. Free online character reference for developers."
        breadcrumbs={breadcrumbs}
      >
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Tabs */}
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-2 mb-6 border border-gray-100 dark:border-gray-700">
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab('ascii')}
                className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all ${
                  activeTab === 'ascii'
                    ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-lg'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                📊 ASCII Table
              </button>
              <button
                onClick={() => setActiveTab('unicode')}
                className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all ${
                  activeTab === 'unicode'
                    ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-lg'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                🔍 Unicode Lookup
              </button>
              <button
                onClick={() => setActiveTab('emoji')}
                className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all ${
                  activeTab === 'emoji'
                    ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-lg'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                😀 Emoji Picker
              </button>
            </div>
          </div>

          {/* ASCII Tab */}
          {activeTab === 'ascii' && (
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700">
              <div className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Search ASCII Table
                    </label>
                    <input
                      type="text"
                      value={asciiSearchQuery}
                      onChange={(e) => setAsciiSearchQuery(e.target.value)}
                      placeholder="Search by code, hex, character, or description..."
                      className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Category
                      </label>
                      <select
                        value={asciiSelectedCategory}
                        onChange={(e) => setAsciiSelectedCategory(e.target.value)}
                        className="w-full px-4 py-2 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                      >
                        <option value="all">All Categories</option>
                        {asciiCategories.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        View Mode
                      </label>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setAsciiViewMode('table')}
                          className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all ${
                            asciiViewMode === 'table'
                              ? 'bg-primary-600 text-white shadow-lg'
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                          }`}
                        >
                          Table
                        </button>
                        <button
                          onClick={() => setAsciiViewMode('grid')}
                          className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all ${
                            asciiViewMode === 'grid'
                              ? 'bg-primary-600 text-white shadow-lg'
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                          }`}
                        >
                          Grid
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Export
                      </label>
                      <div className="flex gap-2">
                        <button
                          onClick={exportAsciiToCSV}
                          className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                        >
                          CSV
                        </button>
                        <button
                          onClick={exportAsciiToJSON}
                          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                        >
                          JSON
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Showing <span className="font-semibold text-gray-900 dark:text-gray-100">{filteredAsciiTable.length}</span> of {asciiTable.length} characters
                  </div>
                </div>
                {asciiViewMode === 'table' ? (
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-gray-100 dark:bg-gray-800">
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700">Dec</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700">Hex</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700">Oct</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700">Binary</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700">Char</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700">Description</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700">Category</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredAsciiTable.map((item, idx) => (
                          <tr key={item.decimal} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                            <td className="px-4 py-2 border border-gray-200 dark:border-gray-700 font-mono text-sm cursor-pointer hover:bg-primary-50 dark:hover:bg-primary-900/20" onClick={() => copyAsciiToClipboard(item.decimal.toString(), idx * 10 + 1)} title="Click to copy">
                              {asciiCopiedIndex === idx * 10 + 1 ? '✓ Copied!' : item.decimal}
                            </td>
                            <td className="px-4 py-2 border border-gray-200 dark:border-gray-700 font-mono text-sm cursor-pointer hover:bg-primary-50 dark:hover:bg-primary-900/20" onClick={() => copyAsciiToClipboard(item.hex, idx * 10 + 2)} title="Click to copy">
                              {asciiCopiedIndex === idx * 10 + 2 ? '✓ Copied!' : `0x${item.hex}`}
                            </td>
                            <td className="px-4 py-2 border border-gray-200 dark:border-gray-700 font-mono text-sm cursor-pointer hover:bg-primary-50 dark:hover:bg-primary-900/20" onClick={() => copyAsciiToClipboard(item.octal, idx * 10 + 3)} title="Click to copy">
                              {asciiCopiedIndex === idx * 10 + 3 ? '✓ Copied!' : `0${item.octal}`}
                            </td>
                            <td className="px-4 py-2 border border-gray-200 dark:border-gray-700 font-mono text-sm cursor-pointer hover:bg-primary-50 dark:hover:bg-primary-900/20" onClick={() => copyAsciiToClipboard(item.binary, idx * 10 + 4)} title="Click to copy">
                              {asciiCopiedIndex === idx * 10 + 4 ? '✓ Copied!' : item.binary}
                            </td>
                            <td className="px-4 py-2 border border-gray-200 dark:border-gray-700 font-mono text-sm cursor-pointer hover:bg-primary-50 dark:hover:bg-primary-900/20 text-center" onClick={() => copyAsciiToClipboard(item.char || item.description, idx * 10 + 5)} title="Click to copy">
                              {asciiCopiedIndex === idx * 10 + 5 ? '✓ Copied!' : (item.char || '—')}
                            </td>
                            <td className="px-4 py-2 border border-gray-200 dark:border-gray-700 text-sm">{item.description}</td>
                            <td className="px-4 py-2 border border-gray-200 dark:border-gray-700 text-xs">
                              <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded">{item.category}</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                    {filteredAsciiTable.map((item, idx) => (
                      <div key={item.decimal} className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                        <div className="text-center mb-2">
                          <div className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">{item.char || '—'}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">{item.decimal}</div>
                        </div>
                        <div className="space-y-1 text-xs">
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Hex:</span>
                            <span className="font-mono cursor-pointer hover:text-primary-600 dark:hover:text-primary-400" onClick={() => copyAsciiToClipboard(item.hex, idx * 10 + 1)}>
                              {asciiCopiedIndex === idx * 10 + 1 ? '✓' : item.hex}
                            </span>
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 truncate" title={item.description}>{item.description}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Unicode Tab */}
          {activeTab === 'unicode' && (
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Enter Character
                  </label>
                  <input
                    type="text"
                    value={unicodeInput}
                    onChange={(e) => setUnicodeInput(e.target.value)}
                    placeholder="Type or paste a character here..."
                    className="w-full px-4 py-3 text-2xl text-center border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                    maxLength={1}
                  />
                </div>
                {unicodeCharInfo && (
                  <div className="p-6 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                    <div className="text-center mb-6">
                      <div className="text-6xl mb-2">{unicodeCharInfo.char}</div>
                      <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">{unicodeCharInfo.name}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">{unicodeCharInfo.category} • {unicodeCharInfo.block}</div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs text-gray-600 dark:text-gray-400 mb-1 block">Code Point</label>
                        <div className="p-3 bg-white dark:bg-gray-900 rounded border border-gray-200 dark:border-gray-700 font-mono text-sm cursor-pointer hover:bg-primary-50 dark:hover:bg-primary-900/20" onClick={() => copyUnicodeToClipboard(`U+${unicodeCharInfo.codePoint.toString(16).toUpperCase().padStart(4, '0')}`, 1)} title="Click to copy">
                          {unicodeCopiedIndex === 1 ? '✓ Copied!' : `U+${unicodeCharInfo.codePoint.toString(16).toUpperCase().padStart(4, '0')}`}
                        </div>
                      </div>
                      <div>
                        <label className="text-xs text-gray-600 dark:text-gray-400 mb-1 block">Decimal</label>
                        <div className="p-3 bg-white dark:bg-gray-900 rounded border border-gray-200 dark:border-gray-700 font-mono text-sm cursor-pointer hover:bg-primary-50 dark:hover:bg-primary-900/20" onClick={() => copyUnicodeToClipboard(unicodeCharInfo.codePoint.toString(), 2)} title="Click to copy">
                          {unicodeCopiedIndex === 2 ? '✓ Copied!' : unicodeCharInfo.codePoint}
                        </div>
                      </div>
                      <div>
                        <label className="text-xs text-gray-600 dark:text-gray-400 mb-1 block">HTML Entity</label>
                        <div className="p-3 bg-white dark:bg-gray-900 rounded border border-gray-200 dark:border-gray-700 font-mono text-sm cursor-pointer hover:bg-primary-50 dark:hover:bg-primary-900/20" onClick={() => copyUnicodeToClipboard(unicodeCharInfo.htmlEntity, 3)} title="Click to copy">
                          {unicodeCopiedIndex === 3 ? '✓ Copied!' : unicodeCharInfo.htmlEntity}
                        </div>
                      </div>
                      <div>
                        <label className="text-xs text-gray-600 dark:text-gray-400 mb-1 block">CSS Escape</label>
                        <div className="p-3 bg-white dark:bg-gray-900 rounded border border-gray-200 dark:border-gray-700 font-mono text-sm cursor-pointer hover:bg-primary-50 dark:hover:bg-primary-900/20" onClick={() => copyUnicodeToClipboard(unicodeCharInfo.cssEscape, 4)} title="Click to copy">
                          {unicodeCopiedIndex === 4 ? '✓ Copied!' : unicodeCharInfo.cssEscape}
                        </div>
                      </div>
                      <div>
                        <label className="text-xs text-gray-600 dark:text-gray-400 mb-1 block">JavaScript Escape</label>
                        <div className="p-3 bg-white dark:bg-gray-900 rounded border border-gray-200 dark:border-gray-700 font-mono text-sm cursor-pointer hover:bg-primary-50 dark:hover:bg-primary-900/20" onClick={() => copyUnicodeToClipboard(unicodeCharInfo.jsEscape, 5)} title="Click to copy">
                          {unicodeCopiedIndex === 5 ? '✓ Copied!' : unicodeCharInfo.jsEscape}
                        </div>
                      </div>
                      <div>
                        <label className="text-xs text-gray-600 dark:text-gray-400 mb-1 block">UTF-8 Bytes</label>
                        <div className="p-3 bg-white dark:bg-gray-900 rounded border border-gray-200 dark:border-gray-700 font-mono text-sm cursor-pointer hover:bg-primary-50 dark:hover:bg-primary-900/20" onClick={() => copyUnicodeToClipboard(unicodeCharInfo.utf8, 6)} title="Click to copy">
                          {unicodeCopiedIndex === 6 ? '✓ Copied!' : unicodeCharInfo.utf8}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Search Unicode Characters
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={unicodeSearchQuery}
                      onChange={(e) => setUnicodeSearchQuery(e.target.value)}
                      placeholder="Search by code point (U+0041, 0x41, 65) or name..."
                      className="flex-1 px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                    />
                    <button
                      onClick={handleUnicodeSearch}
                      className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
                    >
                      Search
                    </button>
                  </div>
                </div>
                {unicodeSearchResults.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {unicodeSearchResults.map((result, idx) => (
                      <div key={idx} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                        <div className="text-center mb-2">
                          <div className="text-3xl mb-1">{result.char}</div>
                          <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">{result.name}</div>
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                          <div>U+{result.codePoint.toString(16).toUpperCase().padStart(4, '0')}</div>
                          <div>{result.category} • {result.block}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Emoji Tab */}
          {activeTab === 'emoji' && (
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 dark:border-gray-700">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Search Emojis
                  </label>
                  <input
                    type="text"
                    value={emojiSearchQuery}
                    onChange={(e) => setEmojiSearchQuery(e.target.value)}
                    placeholder="Search emojis by category or keyword..."
                    className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                  />
                </div>
                {emojiRecentEmojis.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Recent Emojis</h3>
                    <div className="flex flex-wrap gap-2">
                      {emojiRecentEmojis.map((emoji, idx) => (
                        <button
                          key={idx}
                          onClick={() => copyEmojiToClipboard(emoji)}
                          className={`text-2xl p-2 rounded-lg border-2 transition-all hover:scale-110 ${
                            emojiCopiedEmoji === emoji
                              ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                              : 'border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-700'
                          }`}
                          title="Click to copy again"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                <div className="flex flex-wrap gap-2 pb-4 border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
                  <button
                    onClick={() => setEmojiSelectedCategory(null)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                      emojiSelectedCategory === null
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
                  >
                    All Categories
                  </button>
                  {filteredEmojiCategories.map((category) => (
                    <button
                      key={category.name}
                      onClick={() => setEmojiSelectedCategory(category.name)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                        emojiSelectedCategory === category.name
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                      }`}
                    >
                      {category.icon} {category.name}
                    </button>
                  ))}
                </div>
                <div className="max-h-[600px] overflow-y-auto">
                  {filteredEmojiCategories
                    .filter(cat => !emojiSelectedCategory || cat.name === emojiSelectedCategory)
                    .map((category) => (
                      <div key={category.name} className="mb-8">
                        <h4 className="text-md font-semibold text-gray-900 dark:text-gray-100 mb-3 sticky top-0 bg-white dark:bg-gray-900 py-2 z-10">
                          {category.icon} {category.name} ({category.emojis.length} emojis)
                        </h4>
                        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2">
                          {category.emojis.map((emoji, idx) => (
                            <button
                              key={`${category.name}-${idx}`}
                              onClick={() => copyEmojiToClipboard(emoji)}
                              className={`text-2xl p-3 rounded-lg border-2 transition-all hover:scale-110 ${
                                emojiCopiedEmoji === emoji
                                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                                  : 'border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-700'
                              }`}
                              title="Click to copy"
                            >
                              {emoji}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}
        </div>
        {relatedTools.length > 0 && (
          <RelatedTools tools={relatedTools} title="Related Text Tools" />
        )}
      </Layout>
    </>
  )
}
