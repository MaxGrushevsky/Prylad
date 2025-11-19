'use client'

import { useState, useCallback, useEffect } from 'react'
import Layout from '@/components/Layout'
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'
interface MarkdownStats {
  words: number
  characters: number
  lines: number
  headings: number
  links: number
  images: number
  codeBlocks: number
}

const markdownExamples = [
  {
    name: 'Basic Formatting',
    content: `# Heading 1
## Heading 2
### Heading 3

**Bold text** and *italic text*

- Unordered list item 1
- Unordered list item 2
- Unordered list item 3

1. Ordered list item 1
2. Ordered list item 2
3. Ordered list item 3

[Link text](https://example.com)

\`inline code\`

> Blockquote text`
  },
  {
    name: 'Code Block',
    content: `\`\`\`javascript
function hello() {
  console.log('Hello, World!');
}
\`\`\``
  },
  {
    name: 'Table',
    content: `| Column 1 | Column 2 | Column 3 |
|----------|----------|----------|
| Row 1    | Data 1   | Data 2   |
| Row 2    | Data 3   | Data 4   |
| Row 3    | Data 5   | Data 6   |`
  },
  {
    name: 'Full Document',
    content: `# My Document

## Introduction

This is a **markdown** document with various *formatting* options.

### Features

- Feature 1
- Feature 2
- Feature 3

### Code Example

\`\`\`python
def greet(name):
    return f"Hello, {name}!"
\`\`\`

### Links and Images

[Visit Example](https://example.com)

![Alt text](https://via.placeholder.com/300)

> This is a blockquote with important information.

---

Made with ❤️ using Markdown`
  }
]

export default function MarkdownPage() {
  const [markdown, setMarkdown] = useState('# Heading\n\n**Bold text** and *italic*')
  const [autoPreview, setAutoPreview] = useState(true)
  const [totalRendered, setTotalRendered] = useState(0)
  const parseMarkdown = useCallback((text: string): string => {
    let html = text

    // Code blocks (must be processed first)
    html = html.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
      const language = lang || 'text'
      const escaped = code
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')
      return `<pre><code class="language-${language}">${escaped}</code></pre>`
    })

    // Inline code
    html = html.replace(/`([^`]+)`/g, '<code>$1</code>')

    // Headings
    html = html.replace(/^###### (.*$)/gim, '<h6>$1</h6>')
    html = html.replace(/^##### (.*$)/gim, '<h5>$1</h5>')
    html = html.replace(/^#### (.*$)/gim, '<h4>$1</h4>')
    html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>')
    html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>')
    html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>')

    // Horizontal rule
    html = html.replace(/^---$/gim, '<hr />')
    html = html.replace(/^\*\*\*$/gim, '<hr />')

    // Blockquotes
    html = html.replace(/^> (.*$)/gim, '<blockquote>$1</blockquote>')

    // Bold and italic (bold first to avoid conflicts)
    html = html.replace(/\*\*\*(.*?)\*\*\*/gim, '<strong><em>$1</em></strong>')
    html = html.replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
    html = html.replace(/\*(.*?)\*/gim, '<em>$1</em>')
    html = html.replace(/__(.*?)__/gim, '<strong>$1</strong>')
    html = html.replace(/_(.*?)_/gim, '<em>$1</em>')

    // Strikethrough
    html = html.replace(/~~(.*?)~~/gim, '<del>$1</del>')

    // Links
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/gim, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')

    // Images
    html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/gim, '<img src="$2" alt="$1" class="max-w-full rounded-lg" />')

    // Tables
    html = html.replace(/\|(.+)\|/gim, (match, content) => {
      const cells = content.split('|').map((cell: string) => cell.trim())
      if (cells.some(cell => cell.match(/^:?-+:?$/))) {
        return '' // Skip separator rows
      }
      return '<tr>' + cells.map((cell: string) => `<td>${cell}</td>`).join('') + '</tr>'
    })
    html = html.replace(/(<tr>.*<\/tr>)/gim, '<table class="border-collapse border border-gray-300 w-full my-4"><tbody>$1</tbody></table>')

    // Unordered lists
    html = html.replace(/^[\*\-] (.*$)/gim, '<li>$1</li>')
    html = html.replace(/(<li>.*<\/li>)/gim, '<ul class="list-disc list-inside my-2">$1</ul>')

    // Ordered lists
    html = html.replace(/^\d+\. (.*$)/gim, '<li>$1</li>')
    // Note: This is simplified - in real implementation, we'd need to track list context

    // Line breaks
    html = html.replace(/\n\n/gim, '</p><p>')
    html = html.replace(/\n/gim, '<br />')

    // Wrap in paragraphs
    if (!html.startsWith('<')) {
      html = '<p>' + html
    }
    if (!html.endsWith('>')) {
      html = html + '</p>'
    }

    // Clean up empty paragraphs
    html = html.replace(/<p><\/p>/gim, '')
    html = html.replace(/<p>(<[^>]+>)/gim, '$1')
    html = html.replace(/(<\/[^>]+>)<\/p>/gim, '$1')

    return html
  }, [])

  const getStats = useCallback((text: string): MarkdownStats => {
    const words = text.trim() ? text.trim().split(/\s+/).length : 0
    const characters = text.length
    const lines = text.split('\n').length
    const headings = (text.match(/^#+\s/gm) || []).length
    const links = (text.match(/\[([^\]]+)\]\(([^)]+)\)/g) || []).length
    const images = (text.match(/!\[([^\]]*)\]\(([^)]+)\)/g) || []).length
    const codeBlocks = (text.match(/```[\s\S]*?```/g) || []).length

    return {
      words,
      characters,
      lines,
      headings,
      links,
      images,
      codeBlocks
    }
  }, [])

  const [preview, setPreview] = useState('')
  const [stats, setStats] = useState<MarkdownStats>(getStats(markdown))

  useEffect(() => {
    if (autoPreview) {
      const timeoutId = setTimeout(() => {
        const rendered = parseMarkdown(markdown)
        setPreview(rendered)
        setStats(getStats(markdown))
        setTotalRendered(prev => prev + 1)
      }, 300)
      return () => clearTimeout(timeoutId)
    }
  }, [markdown, autoPreview, parseMarkdown, getStats])

  useEffect(() => {
    // Initial render
    const rendered = parseMarkdown(markdown)
    setPreview(rendered)
    setStats(getStats(markdown))
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const copyMarkdown = async () => {
    try {
      await navigator.clipboard.writeText(markdown)
    } catch (err) {
    }
  }

  const copyHtml = async () => {
    try {
      await navigator.clipboard.writeText(preview)
    } catch (err) {
    }
  }

  const exportToFile = () => {
    const blob = new Blob([markdown], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.download = 'markdown-' + Date.now() + '.md'
    link.href = url
    link.click()
    URL.revokeObjectURL(url)
  }

  const exportHTML = () => {
    const htmlContent = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Markdown Export</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
    code { background: #f4f4f4; padding: 2px 6px; border-radius: 3px; }
    pre { background: #f4f4f4; padding: 16px; border-radius: 6px; overflow-x: auto; }
    table { border-collapse: collapse; width: 100%; margin: 16px 0; }
    table td, table th { border: 1px solid #ddd; padding: 8px; }
    blockquote { border-left: 4px solid #ddd; padding-left: 16px; margin: 16px 0; color: #666; }
  </style>
</head>
<body>
${preview}
</body>
</html>`
    const blob = new Blob([htmlContent], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.download = 'markdown-' + Date.now() + '.html'
    link.href = url
    link.click()
    URL.revokeObjectURL(url)
  }

  const loadExample = (example: typeof markdownExamples[0]) => {
    setMarkdown(example.content)
  }

  const clearAll = () => {
    setMarkdown('')
    setPreview('')
    setStats(getStats(''))
  }

  // Keyboard shortcuts
  useKeyboardShortcuts({
    onSave: () => exportToFile(),
    onClear: () => clearAll()
  })

  return (
    <>
      <Layout
        title="📄 Markdown Editor & Preview - Real-time Markdown Preview Online"
      description="Edit and preview Markdown in real-time. Free online Markdown editor with live preview, syntax highlighting, export to HTML, and comprehensive formatting support. Perfect for writing documentation, README files, and formatted text."
    >
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Editor */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Markdown Editor</h2>
              {totalRendered > 0 && (
                <div className="text-sm text-gray-500">
                  Rendered: <span className="font-semibold text-gray-900">{totalRendered}</span>
                </div>
              )}
            </div>

            {/* Quick Examples */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Quick Examples:</label>
              <div className="grid grid-cols-2 gap-2">
                {markdownExamples.map((example) => (
                  <button
                    key={example.name}
                    onClick={() => loadExample(example)}
                    className="px-3 py-2 text-left bg-gray-50 hover:bg-gray-100 rounded-lg text-xs transition-colors"
                  >
                    <div className="font-semibold text-gray-900">{example.name}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Editor */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-semibold text-gray-700">Markdown Source</label>
                <div className="flex gap-2">
                  <button
                    onClick={copyMarkdown}
                    className="px-3 py-1 bg-gray-600 text-white text-sm rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    Copy
                  </button>
                  <button
                    onClick={clearAll}
                    className="px-3 py-1 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Clear
                  </button>
                </div>
              </div>
              <textarea
                value={markdown}
                onChange={(e) => setMarkdown(e.target.value)}
                className="w-full h-96 px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 resize-none font-mono text-sm"
                placeholder="# Heading...&#10;&#10;**Bold text** and *italic*"
                spellCheck={false}
              />
              <p className="mt-2 text-xs text-gray-500">
                Characters: {stats.characters} | Words: {stats.words} | Lines: {stats.lines}
              </p>
            </div>

            {/* Auto Preview Toggle */}
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={autoPreview}
                onChange={(e) => setAutoPreview(e.target.checked)}
                className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
              />
              <span className="text-sm text-gray-700">Auto-preview as you type</span>
            </label>

            {!autoPreview && (
              <button
                onClick={() => {
                  const rendered = parseMarkdown(markdown)
                  setPreview(rendered)
                  setStats(getStats(markdown))
                  setTotalRendered(prev => prev + 1)
                }}
                className="w-full bg-gradient-to-r from-primary-600 to-primary-700 text-white font-semibold py-3 px-6 rounded-xl hover:from-primary-700 hover:to-primary-800 transition-all shadow-lg"
              >
                Render Preview
              </button>
            )}

            {/* Export Buttons */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={exportToFile}
                className="px-4 py-2 bg-purple-600 text-white text-sm font-semibold rounded-lg hover:bg-purple-700 transition-colors"
              >
                Export MD
              </button>
              <button
                onClick={exportHTML}
                className="px-4 py-2 bg-purple-600 text-white text-sm font-semibold rounded-lg hover:bg-purple-700 transition-colors"
              >
                Export HTML
              </button>
            </div>
          </div>

          {/* Preview */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Preview</h2>
              <button
                onClick={copyHtml}
                className="px-3 py-1 bg-gray-600 text-white text-sm rounded-lg hover:bg-gray-700 transition-colors"
              >
                Copy HTML
              </button>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-3 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{stats.headings}</div>
                <div className="text-xs text-gray-600">Headings</div>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{stats.links}</div>
                <div className="text-xs text-gray-600">Links</div>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{stats.codeBlocks}</div>
                <div className="text-xs text-gray-600">Code Blocks</div>
              </div>
            </div>

            {/* Preview Content */}
            <div
              className="w-full h-96 px-4 py-3 border-2 border-gray-200 rounded-lg bg-white overflow-y-auto prose prose-gray max-w-none"
              dangerouslySetInnerHTML={{ __html: preview || '<p class="text-gray-400">Preview will appear here...</p>' }}
            />
          </div>
        </div>

        {/* SEO Content */}
        <div className="max-w-4xl mx-auto mt-16 space-y-8">
          <section className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">What is Markdown?</h2>
            <div className="prose prose-gray max-w-none">
              <p className="text-gray-700 leading-relaxed mb-4">
                Markdown is a lightweight markup language that you can use to add formatting elements to plaintext text documents. 
                Created by John Gruber in 2004, Markdown is now one of the world&apos;s most popular markup languages.
              </p>
              <p className="text-gray-700 leading-relaxed">
                Our free Markdown editor provides a real-time preview of your formatted text. Write in Markdown syntax and see 
                the rendered HTML instantly. Perfect for writing documentation, README files, blog posts, and any formatted text 
                that needs to be converted to HTML.
              </p>
            </div>
          </section>

          <section className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Markdown Syntax Guide</h2>
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Headings</h3>
                <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
{`# Heading 1
## Heading 2
### Heading 3`}
                </pre>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Text Formatting</h3>
                <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
{`**bold text**
*italic text*
~~strikethrough~~`}
                </pre>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Lists</h3>
                <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
{`- Unordered item
1. Ordered item`}
                </pre>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Links and Images</h3>
                <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
{`[Link text](https://example.com)
![Alt text](image.jpg)`}
                </pre>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Code</h3>
                <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
{`\`inline code\`

\`\`\`javascript
// Code block
\`\`\``}
                </pre>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Tables</h3>
                <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
{`| Column 1 | Column 2 |
|----------|----------|
| Data 1   | Data 2   |`}
                </pre>
              </div>
            </div>
          </section>

          <section className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Common Use Cases</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">📝 Documentation</h3>
                <p className="text-gray-700 text-sm">
                  Write README files, API documentation, and technical guides in Markdown. Easy to read in source form 
                  and beautifully rendered when converted to HTML.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">📚 Blog Posts</h3>
                <p className="text-gray-700 text-sm">
                  Many static site generators and blogging platforms support Markdown. Write your posts in Markdown and 
                  let the platform handle the HTML conversion.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">💬 Comments & Messages</h3>
                <p className="text-gray-700 text-sm">
                  GitHub, Reddit, Discord, and many other platforms support Markdown formatting. Use Markdown to format 
                  your comments and messages.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">📊 Notes & Documentation</h3>
                <p className="text-gray-700 text-sm">
                  Keep notes, meeting minutes, and documentation in Markdown format. Easy to version control with Git 
                  and readable in any text editor.
                </p>
              </div>
            </div>
          </section>

          <section className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Key Features</h2>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-primary-600 font-bold">✓</span>
                <span><strong>Real-time Preview:</strong> See your Markdown rendered as HTML instantly as you type.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary-600 font-bold">✓</span>
                <span><strong>Comprehensive Syntax Support:</strong> Headings, lists, links, images, tables, code blocks, blockquotes, and more.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary-600 font-bold">✓</span>
                <span><strong>Export Options:</strong> Export your Markdown as .md file or as a complete HTML document.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary-600 font-bold">✓</span>
                <span><strong>Quick Examples:</strong> Load pre-made examples to learn Markdown syntax quickly.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary-600 font-bold">✓</span>
                <span><strong>Statistics:</strong> Track headings, links, code blocks, and other elements in your document.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary-600 font-bold">✓</span>
                <span><strong>Privacy First:</strong> All processing happens in your browser. We never see or store your content.</span>
              </li>
            </ul>
          </section>

          <section className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">What Markdown features are supported?</h3>
                <p className="text-gray-700 text-sm">
                  Our editor supports headings (H1-H6), bold, italic, strikethrough, unordered and ordered lists, links, 
                  images, inline code, code blocks, blockquotes, horizontal rules, and tables. This covers most common 
                  Markdown use cases.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Can I export my Markdown?</h3>
                <p className="text-gray-700 text-sm">
                  Yes! You can export your Markdown source as a .md file, or export the rendered HTML as a complete HTML 
                  document with embedded styles.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Is my content stored or transmitted?</h3>
                <p className="text-gray-700 text-sm">
                  No, all Markdown processing happens entirely in your browser. We never see, store, or transmit any of 
                  your content. Your privacy is completely protected.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Can I use this for GitHub README files?</h3>
                <p className="text-gray-700 text-sm">
                  Yes! Our Markdown editor supports the syntax commonly used in GitHub README files. Write your README 
                  here, preview it, and then copy it to your GitHub repository.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Does the editor support syntax highlighting for code blocks?</h3>
                <p className="text-gray-700 text-sm">
                  Code blocks are preserved with language identifiers, but full syntax highlighting in the preview requires 
                  additional CSS libraries. The exported HTML includes basic styling for code blocks.
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </Layout>
    </>
  )
}
