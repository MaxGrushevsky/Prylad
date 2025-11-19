'use client'

import { useState, useEffect, useCallback } from 'react'
import Layout from '@/components/Layout'
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'
type NameStyle = 'modern' | 'classic' | 'fantasy' | 'sci-fi'
type Gender = 'any' | 'male' | 'female'

const firstNames: Record<NameStyle, { male: string[], female: string[] }> = {
  modern: {
    male: ['James', 'John', 'Robert', 'Michael', 'William', 'David', 'Richard', 'Joseph', 'Thomas', 'Christopher', 'Daniel', 'Matthew', 'Anthony', 'Mark', 'Donald', 'Steven', 'Paul', 'Andrew', 'Joshua', 'Kenneth', 'Ryan', 'Jacob', 'Gary', 'Nicholas', 'Eric', 'Jonathan', 'Stephen', 'Larry', 'Justin', 'Scott'],
    female: ['Mary', 'Patricia', 'Jennifer', 'Linda', 'Elizabeth', 'Barbara', 'Susan', 'Jessica', 'Sarah', 'Karen', 'Nancy', 'Lisa', 'Betty', 'Margaret', 'Sandra', 'Ashley', 'Kimberly', 'Emily', 'Donna', 'Michelle', 'Dorothy', 'Carol', 'Amanda', 'Melissa', 'Deborah', 'Stephanie', 'Rebecca', 'Sharon', 'Laura', 'Cynthia']
  },
  classic: {
    male: ['Alexander', 'Benjamin', 'Charles', 'Edward', 'Frederick', 'George', 'Henry', 'James', 'John', 'Joseph', 'Louis', 'Michael', 'Nicholas', 'Patrick', 'Richard', 'Robert', 'Samuel', 'Thomas', 'William', 'Arthur', 'David', 'Francis', 'Harold', 'Lawrence', 'Peter', 'Raymond', 'Theodore', 'Victor', 'Walter', 'Albert'],
    female: ['Alice', 'Amelia', 'Beatrice', 'Charlotte', 'Eleanor', 'Elizabeth', 'Emma', 'Grace', 'Hannah', 'Isabella', 'Jane', 'Katherine', 'Lucy', 'Margaret', 'Mary', 'Olivia', 'Rose', 'Sophia', 'Victoria', 'Abigail', 'Anne', 'Catherine', 'Clara', 'Dorothy', 'Edith', 'Florence', 'Harriet', 'Josephine', 'Louise', 'Martha']
  },
  fantasy: {
    male: ['Aragorn', 'Gandalf', 'Legolas', 'Thorin', 'Bilbo', 'Frodo', 'Aragorn', 'Boromir', 'Faramir', 'Eomer', 'Theoden', 'Elrond', 'Celeborn', 'Thranduil', 'Bard', 'Balin', 'Dwalin', 'Fili', 'Kili', 'Gimli', 'Merry', 'Pippin', 'Samwise', 'Gollum', 'Sauron', 'Saruman', 'Radagast', 'Beorn', 'Tom'],
    female: ['Arwen', 'Galadriel', 'Eowyn', 'Luthien', 'Idril', 'Aredhel', 'Nimrodel', 'Celebrian', 'Finduilas', 'Melian', 'Yavanna', 'Varda', 'Nienna', 'Estë', 'Nessa', 'Vairë', 'Vána', 'Nerdanel', 'Anairë', 'Eärwen', 'Indis', 'Míriel', 'Tar-Míriel', 'Tar-Ancalimë', 'Tar-Telperiën', 'Tar-Vanimeldë', 'Tar-Alcarin', 'Tar-Calmacil', 'Tar-Ardamin', 'Tar-Ar-Pharazôn']
  },
  'sci-fi': {
    male: ['Zephyr', 'Nexus', 'Orion', 'Atlas', 'Phoenix', 'Titan', 'Apex', 'Quantum', 'Nova', 'Cosmos', 'Stellar', 'Vortex', 'Matrix', 'Neo', 'Morpheus', 'Trinity', 'Cipher', 'Tank', 'Mouse', 'Apoc', 'Switch', 'Ghost', 'Niobe', 'Seraph', 'Lock', 'Link', 'Sparks', 'Rhineheart', 'Ballard', 'Roland'],
    female: ['Aurora', 'Nova', 'Luna', 'Stella', 'Celeste', 'Lyra', 'Andromeda', 'Nebula', 'Vega', 'Sirius', 'Athena', 'Artemis', 'Selene', 'Iris', 'Phoebe', 'Theia', 'Rhea', 'Metis', 'Themis', 'Mnemosyne', 'Tethys', 'Dione', 'Maia', 'Electra', 'Taygete', 'Celaeno', 'Alcyone', 'Sterope', 'Merope', 'Asterope']
  }
}

const lastNames: Record<NameStyle, string[]> = {
  modern: ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson', 'Walker', 'Young'],
  classic: ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson', 'Walker', 'Young'],
  fantasy: ['Ironforge', 'Shadowbane', 'Stormwind', 'Lightbringer', 'Darkwood', 'Silverleaf', 'Moonwhisper', 'Starfire', 'Dragonheart', 'Frostweaver', 'Thunderstrike', 'Firebrand', 'Nightshade', 'Brightblade', 'Stonehelm', 'Goldleaf', 'Swiftarrow', 'Blackthorn', 'Whiteclaw', 'Redmoon', 'Bluewind', 'Greenbough', 'Greywolf', 'Silvershield', 'Bronzebeard', 'Ironheart', 'Steelclaw', 'Oakenshield', 'Elmwood', 'Ashford'],
  'sci-fi': ['Nexus', 'Quantum', 'Stellar', 'Vortex', 'Matrix', 'Nova', 'Cosmos', 'Atlas', 'Orion', 'Phoenix', 'Titan', 'Apex', 'Zenith', 'Polaris', 'Vega', 'Sirius', 'Andromeda', 'Nebula', 'Galaxy', 'Comet', 'Asteroid', 'Meteor', 'Solar', 'Lunar', 'Martian', 'Venusian', 'Jovian', 'Saturnian', 'Neptunian', 'Plutonian']
}

const nicknames: Record<string, string[]> = {
  gaming: ['Shadow', 'Dragon', 'Phoenix', 'Wolf', 'Eagle', 'Tiger', 'Lion', 'Falcon', 'Storm', 'Thunder', 'Fire', 'Ice', 'Dark', 'Light', 'Night', 'Day', 'Star', 'Moon', 'Sun', 'Sky', 'Blade', 'Arrow', 'Shield', 'Sword', 'Bow', 'Axe', 'Spear', 'Dagger', 'Mace', 'Hammer'],
  cool: ['Ace', 'Blaze', 'Flash', 'Ghost', 'Joker', 'King', 'Legend', 'Maverick', 'Ninja', 'Phantom', 'Raven', 'Rebel', 'Rogue', 'Sage', 'Scout', 'Sniper', 'Stealth', 'Viper', 'Warrior', 'Zeus', 'Apollo', 'Atlas', 'Hercules', 'Mars', 'Neptune', 'Pluto', 'Saturn', 'Jupiter', 'Mercury', 'Venus'],
  cute: ['Bunny', 'Kitty', 'Puppy', 'Bear', 'Duck', 'Bird', 'Fish', 'Bee', 'Butterfly', 'Flower', 'Star', 'Moon', 'Sun', 'Cloud', 'Rainbow', 'Sparkle', 'Twinkle', 'Glitter', 'Shine', 'Bright', 'Sweet', 'Sugar', 'Honey', 'Candy', 'Cookie', 'Cupcake', 'Muffin', 'Pie', 'Cake', 'Donut'],
  professional: ['Ace', 'Pro', 'Elite', 'Master', 'Expert', 'Guru', 'Wizard', 'Genius', 'Brain', 'Mind', 'Thinker', 'Sage', 'Wise', 'Smart', 'Sharp', 'Quick', 'Fast', 'Swift', 'Rapid', 'Turbo', 'Super', 'Ultra', 'Mega', 'Max', 'Prime', 'Alpha', 'Beta', 'Gamma', 'Delta', 'Omega']
}

export default function NameGeneratorPage() {
  const [type, setType] = useState<'full' | 'nickname'>('full')
  const [nameStyle, setNameStyle] = useState<NameStyle>('modern')
  const [gender, setGender] = useState<Gender>('any')
  const [nicknameStyle, setNicknameStyle] = useState<string>('gaming')
  const [includeNumbers, setIncludeNumbers] = useState(true)
  const [count, setCount] = useState(5)
  const [results, setResults] = useState<string[]>([])
  const [totalGenerated, setTotalGenerated] = useState(0)
  const generate = useCallback(() => {
    if (type === 'full') {
      const newNames = Array.from({ length: count }, () => {
        const styleNames = firstNames[nameStyle]
        let firstName: string
        
        if (gender === 'male') {
          firstName = styleNames.male[Math.floor(Math.random() * styleNames.male.length)]
        } else if (gender === 'female') {
          firstName = styleNames.female[Math.floor(Math.random() * styleNames.female.length)]
        } else {
          const allNames = [...styleNames.male, ...styleNames.female]
          firstName = allNames[Math.floor(Math.random() * allNames.length)]
        }
        
        const lastName = lastNames[nameStyle][Math.floor(Math.random() * lastNames[nameStyle].length)]
        return `${firstName} ${lastName}`
      })
      setResults(newNames)
      setTotalGenerated(prev => prev + newNames.length)
    } else {
      const styleNicknames = nicknames[nicknameStyle]
      const newNicknames = Array.from({ length: count }, () => {
        const nickname = styleNicknames[Math.floor(Math.random() * styleNicknames.length)]
        if (includeNumbers) {
          const number = Math.floor(Math.random() * 9999)
          return `${nickname}${number}`
        }
        return nickname
      })
      setResults(newNicknames)
      setTotalGenerated(prev => prev + newNicknames.length)
    }
  }, [type, nameStyle, gender, nicknameStyle, includeNumbers, count])

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
    } catch (err) {
    }
  }

  const copyAll = async () => {
    if (results.length === 0) return
    try {
      await navigator.clipboard.writeText(results.join('\n'))
    } catch (err) {
    }
  }

  const exportToFile = () => {
    if (results.length === 0) return
    
    const content = results.join('\n')
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `names-${Date.now()}.txt`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  // Keyboard shortcuts
  useKeyboardShortcuts({
    onEnter: () => generate(),
    onSave: () => exportToFile(),
    onClear: () => {
      setResults([])
    }
  })

  // Save settings to localStorage
  useEffect(() => {
    const settings = {
      type,
      nameStyle,
      gender,
      nicknameStyle,
      includeNumbers,
      count
    }
    localStorage.setItem('nameGeneratorSettings', JSON.stringify(settings))
  }, [type, nameStyle, gender, nicknameStyle, includeNumbers, count])

  // Load settings from localStorage on mount and generate
  useEffect(() => {
    const saved = localStorage.getItem('nameGeneratorSettings')
    let loadedType: 'full' | 'nickname' = 'full'
    let loadedNameStyle: NameStyle = 'modern'
    let loadedGender: Gender = 'any'
    let loadedNicknameStyle = 'gaming'
    let loadedIncludeNumbers = true
    let loadedCount = 5
    
    if (saved) {
      try {
        const settings = JSON.parse(saved)
        loadedType = settings.type || 'full'
        loadedNameStyle = settings.nameStyle || 'modern'
        loadedGender = settings.gender || 'any'
        loadedNicknameStyle = settings.nicknameStyle || 'gaming'
        loadedIncludeNumbers = settings.includeNumbers !== undefined ? settings.includeNumbers : true
        loadedCount = settings.count || 5
        setType(loadedType)
        setNameStyle(loadedNameStyle)
        setGender(loadedGender)
        setNicknameStyle(loadedNicknameStyle)
        setIncludeNumbers(loadedIncludeNumbers)
        setCount(loadedCount)
      } catch (e) {
        // Ignore parse errors
      }
    }
    
    // Auto-generate on mount with loaded settings
    setTimeout(() => {
      if (loadedType === 'full') {
        const styleNames = firstNames[loadedNameStyle]
        const newNames = Array.from({ length: loadedCount }, () => {
          let firstName: string
          if (loadedGender === 'male') {
            firstName = styleNames.male[Math.floor(Math.random() * styleNames.male.length)]
          } else if (loadedGender === 'female') {
            firstName = styleNames.female[Math.floor(Math.random() * styleNames.female.length)]
          } else {
            const allNames = [...styleNames.male, ...styleNames.female]
            firstName = allNames[Math.floor(Math.random() * allNames.length)]
          }
          const lastName = lastNames[loadedNameStyle][Math.floor(Math.random() * lastNames[loadedNameStyle].length)]
          return `${firstName} ${lastName}`
        })
        setResults(newNames)
        setTotalGenerated(prev => prev + newNames.length)
      } else {
        const styleNicknames = nicknames[loadedNicknameStyle]
        const newNicknames = Array.from({ length: loadedCount }, () => {
          const nickname = styleNicknames[Math.floor(Math.random() * styleNicknames.length)]
          if (loadedIncludeNumbers) {
            const number = Math.floor(Math.random() * 9999)
            return `${nickname}${number}`
          }
          return nickname
        })
        setResults(newNicknames)
        setTotalGenerated(prev => prev + newNicknames.length)
      }
    }, 0)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <Layout
      title="👤 Name and Nickname Generator"
      description="Generate random names and nicknames for games, stories, characters, and more. Multiple styles: modern, classic, fantasy, sci-fi. Free online name generator with gender options."
    >
      <div className="max-w-4xl mx-auto">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 mb-6">
          <div className="space-y-6">
            {/* Type Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Type:</label>
              <div className="flex gap-3">
                <button
                  onClick={() => setType('full')}
                  className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all ${
                    type === 'full'
                      ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Full Name
                </button>
                <button
                  onClick={() => setType('nickname')}
                  className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all ${
                    type === 'nickname'
                      ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Nickname
                </button>
              </div>
            </div>

            {/* Full Name Options */}
            {type === 'full' && (
              <>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Name Style:</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {(['modern', 'classic', 'fantasy', 'sci-fi'] as NameStyle[]).map((style) => (
                      <button
                        key={style}
                        onClick={() => setNameStyle(style)}
                        className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                          nameStyle === style
                            ? 'bg-primary-600 text-white shadow-md'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {style === 'sci-fi' ? 'Sci-Fi' : style.charAt(0).toUpperCase() + style.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Gender:</label>
                  <div className="flex gap-3">
                    {(['any', 'male', 'female'] as Gender[]).map((g) => (
                      <button
                        key={g}
                        onClick={() => setGender(g)}
                        className={`flex-1 px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                          gender === g
                            ? 'bg-primary-600 text-white shadow-md'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {g.charAt(0).toUpperCase() + g.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Nickname Options */}
            {type === 'nickname' && (
              <>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Nickname Style:</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {(['gaming', 'cool', 'cute', 'professional'] as string[]).map((style) => (
                      <button
                        key={style}
                        onClick={() => setNicknameStyle(style)}
                        className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                          nicknameStyle === style
                            ? 'bg-primary-600 text-white shadow-md'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {style.charAt(0).toUpperCase() + style.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="include-numbers"
                    checked={includeNumbers}
                    onChange={(e) => setIncludeNumbers(e.target.checked)}
                    className="w-4 h-4 accent-primary-600"
                  />
                  <label htmlFor="include-numbers" className="text-sm text-gray-700 cursor-pointer">
                    Include numbers (e.g., Shadow1234)
                  </label>
                </div>
              </>
            )}

            {/* Count */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Count: <span className="text-primary-600 font-bold">{count}</span>
              </label>
              <input
                type="range"
                min="1"
                max="50"
                value={count}
                onChange={(e) => setCount(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none accent-primary-600"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>1</span>
                <span>50</span>
              </div>
            </div>

            {/* Generate Button */}
            <button
              onClick={generate}
              className="w-full bg-gradient-to-r from-primary-600 to-primary-700 text-white font-semibold py-3 px-6 rounded-xl hover:from-primary-700 hover:to-primary-800 transition-all shadow-lg"
            >
              Generate {count > 1 ? `${count} ${type === 'full' ? 'Names' : 'Nicknames'}` : type === 'full' ? 'Name' : 'Nickname'}
            </button>

            {/* Statistics */}
            {totalGenerated > 0 && (
              <div className="text-center text-sm text-gray-600 pt-2 border-t border-gray-200">
                Total generated: <span className="font-semibold text-primary-600">{totalGenerated}</span> {totalGenerated === 1 ? 'item' : 'items'}
              </div>
            )}
          </div>
        </div>

        {/* Results */}
        {results.length > 0 && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100">
            <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
              <h3 className="text-lg font-bold">Generated {type === 'full' ? 'Names' : 'Nicknames'}:</h3>
              <div className="flex gap-2">
                <button
                  onClick={exportToFile}
                  className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors text-sm flex items-center gap-1"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Export
                </button>
                <button
                  onClick={copyAll}
                  className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors text-sm"
                >
                  Copy All
                </button>
              </div>
            </div>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {results.map((result, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
                >
                  <span className="flex-1 font-medium">{result}</span>
                  <button
                    onClick={() => copyToClipboard(result)}
                    className="text-gray-500 hover:text-primary-600 transition-colors text-lg"
                    title="Copy to clipboard"
                  >
                    📋
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SEO Content */}
        <div className="max-w-4xl mx-auto mt-16 space-y-8">
          {/* Introduction */}
          <section className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Why Use a Name Generator?</h2>
            <div className="prose prose-gray max-w-none">
              <p className="text-gray-700 leading-relaxed mb-4">
                Whether you're creating characters for a story, developing game personas, brainstorming usernames, 
                or need placeholder names for testing, a name generator is an invaluable tool. Coming up with unique, 
                appropriate names can be time-consuming and challenging, especially when you need multiple options 
                or names that fit a specific theme or style.
              </p>
              <p className="text-gray-700 leading-relaxed">
                Our free name generator provides instant access to thousands of name combinations across multiple 
                styles and categories. Generate realistic modern names, classic traditional names, fantasy character 
                names, or sci-fi inspired identifiers. All generation happens locally in your browser, ensuring 
                complete privacy and security.
              </p>
            </div>
          </section>

          {/* Use Cases */}
          <section className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Common Use Cases</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">📚 Writing & Storytelling</h3>
                <p className="text-gray-700 text-sm">
                  Create unique character names for novels, short stories, screenplays, and other creative writing 
                  projects. Choose from modern, classic, fantasy, or sci-fi styles to match your story's setting 
                  and tone.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">🎮 Gaming & Role-Playing</h3>
                <p className="text-gray-700 text-sm">
                  Generate character names for video games, tabletop RPGs, or online gaming platforms. Create memorable 
                  usernames and gamer tags that stand out while fitting your character's personality or game world.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">💻 Development & Testing</h3>
                <p className="text-gray-700 text-sm">
                  Use generated names for testing applications, creating sample data, populating databases, or 
                  generating placeholder content during development. Perfect for QA testing and demos.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">🌐 Online Identity</h3>
                <p className="text-gray-700 text-sm">
                  Create unique usernames, social media handles, or online personas. Generate cool nicknames for 
                  gaming, professional aliases for work, or cute names for personal accounts.
                </p>
              </div>
            </div>
          </section>

          {/* Name Styles */}
          <section className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Name Styles Explained</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Modern Names</h3>
                <p className="text-gray-700 text-sm mb-3">
                  Contemporary first and last names commonly used today. Perfect for realistic characters, 
                  modern settings, or when you need believable, everyday names.
                </p>
                <p className="text-xs text-gray-600"><strong>Best for:</strong> Contemporary fiction, realistic characters, modern settings</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Classic Names</h3>
                <p className="text-gray-700 text-sm mb-3">
                  Traditional, timeless names with historical significance. These names have stood the test of time 
                  and work well for period pieces, formal characters, or elegant personas.
                </p>
                <p className="text-xs text-gray-600"><strong>Best for:</strong> Historical fiction, period dramas, formal characters</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Fantasy Names</h3>
                <p className="text-gray-700 text-sm mb-3">
                  Inspired by fantasy literature and mythology. These names evoke magical worlds, epic adventures, 
                  and legendary characters from fantasy realms.
                </p>
                <p className="text-xs text-gray-600"><strong>Best for:</strong> Fantasy games, epic fantasy stories, magical characters</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Sci-Fi Names</h3>
                <p className="text-gray-700 text-sm mb-3">
                  Futuristic and space-themed names perfect for science fiction settings. These names suggest advanced 
                  technology, space exploration, and futuristic societies.
                </p>
                <p className="text-xs text-gray-600"><strong>Best for:</strong> Science fiction, space operas, futuristic settings</p>
              </div>
            </div>
          </section>

          {/* Features */}
          <section className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Key Features</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="flex items-start gap-3">
                <span className="text-2xl">🎨</span>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Multiple Styles</h3>
                  <p className="text-gray-700 text-sm">
                    Choose from modern, classic, fantasy, or sci-fi name styles. Each style includes hundreds of 
                    carefully curated names for maximum variety and authenticity.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl">👥</span>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Gender Options</h3>
                  <p className="text-gray-700 text-sm">
                    Generate male names, female names, or mix both. Perfect for creating diverse character rosters 
                    or when gender doesn't matter for your use case.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl">🎮</span>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Nickname Styles</h3>
                  <p className="text-gray-700 text-sm">
                    Generate gaming nicknames, cool aliases, cute usernames, or professional handles. Optional number 
                    suffixes for added uniqueness.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl">⚡</span>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Batch Generation</h3>
                  <p className="text-gray-700 text-sm">
                    Generate up to 50 names or nicknames at once. Perfect for populating character lists, creating 
                    test data, or finding the perfect name from multiple options.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl">📥</span>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Export Options</h3>
                  <p className="text-gray-700 text-sm">
                    Copy individual names or export all results to a text file. Easy integration into your projects, 
                    documents, or character sheets.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl">🔒</span>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Privacy Guaranteed</h3>
                  <p className="text-gray-700 text-sm">
                    All name generation happens locally in your browser. We never see, store, or have access to any 
                    generated names or your preferences.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* FAQ */}
          <section className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Can I use these names for commercial projects?</h3>
                <p className="text-gray-700 text-sm">
                  Yes! All generated names are free to use for any purpose, including commercial projects, games, 
                  books, and other creative works. There are no restrictions on usage.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Are the names unique?</h3>
                <p className="text-gray-700 text-sm">
                  Names are randomly generated from our curated databases, so duplicates are possible but unlikely 
                  when generating multiple names. Each generation is independent, providing fresh combinations each time.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">How many names can I generate?</h3>
                <p className="text-gray-700 text-sm">
                  You can generate up to 50 names or nicknames in a single batch. There's no limit on how many 
                  batches you can generate, so you can create as many names as you need.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Do you store the generated names?</h3>
                <p className="text-gray-700 text-sm">
                  No, absolutely not. All name generation happens entirely in your browser. We never see, store, 
                  transmit, or have any access to the names you generate. Your privacy is completely protected.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Can I customize the nickname format?</h3>
                <p className="text-gray-700 text-sm">
                  Yes! You can choose from different nickname styles (gaming, cool, cute, professional) and optionally 
                  include numbers. The numbers are randomly generated (0-9999) to add uniqueness to your nicknames.
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

