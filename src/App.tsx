import { useState } from 'react'
import { Avatar } from './components/Avatar'
import { Clock } from './components/Clock'
import { GameWindow } from './components/GameWindow'
import { StartMenu, type GameId } from './components/StartMenu'
import { Minesweeper } from './games/Minesweeper'
import { resume } from './data/resume'
import {
  AboutSection,
  CertificationsSection,
  ContactSection,
  EducationSection,
  ExperienceSection,
  LeadershipSection,
  ProjectsSection,
  SkillsSection,
} from './sections'

const TABS = [
  { id: 'about', label: 'About', render: () => <AboutSection /> },
  { id: 'skills', label: 'Skills', render: () => <SkillsSection /> },
  { id: 'experience', label: 'Experience', render: () => <ExperienceSection /> },
  { id: 'projects', label: 'Projects', render: () => <ProjectsSection /> },
  { id: 'leadership', label: 'Leadership', render: () => <LeadershipSection /> },
  { id: 'education', label: 'Education', render: () => <EducationSection /> },
  { id: 'certs', label: 'Certifications', render: () => <CertificationsSection /> },
  { id: 'contact', label: 'Contact', render: () => <ContactSection /> },
] as const

type TabId = (typeof TABS)[number]['id']

export default function App() {
  const [active, setActive] = useState<TabId>('about')
  const [startOpen, setStartOpen] = useState(false)
  const [game, setGame] = useState<GameId | null>(null)
  const current = TABS.find((t) => t.id === active) ?? TABS[0]

  const gameTitles: Record<GameId, string> = { minesweeper: 'Minesweeper' }

  return (
    <div className="desktop">
      <header className="hero">
        <div className="hero__inner">
          <Avatar src={resume.avatar} name={resume.name} className="hero__avatar" />
          <div className="hero__text">
            <p className="hero__eyebrow">~/{resume.handle}</p>
            <h1 className="hero__name">{resume.name}</h1>
            <p className="hero__title">{resume.title}</p>
            <p className="hero__tagline">{resume.tagline}</p>
            <div className="hero__links">
              {resume.links.map((l) => (
                <a key={l.href} href={l.href} target="_blank" rel="noreferrer noopener">
                  [ {l.label} ]
                </a>
              ))}
            </div>
          </div>
        </div>
      </header>

      <nav className="menubar" aria-label="Sections">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            className={`menubar__item ${tab.id === active ? 'is-active' : ''}`}
            onClick={() => setActive(tab.id)}
            aria-current={tab.id === active}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      <main className="stage">
        {current.render()}
        {game === 'minesweeper' && (
          <div className="window-layer">
            <GameWindow title="Minesweeper" onClose={() => setGame(null)}>
              <Minesweeper />
            </GameWindow>
          </div>
        )}
      </main>

      <footer className="taskbar">
        {startOpen && (
          <StartMenu
            onLaunchGame={(id) => setGame(id)}
            onClose={() => setStartOpen(false)}
          />
        )}
        <button
          className={`taskbar__start ${startOpen ? 'is-active' : ''}`}
          onClick={() => setStartOpen((v) => !v)}
          aria-haspopup="true"
          aria-expanded={startOpen}
        >
          <span className="taskbar__logo" aria-hidden="true">
            ▚
          </span>
          Start
        </button>
        <div className="taskbar__window">{game ? gameTitles[game] : current.label}</div>
        <Clock />
      </footer>
    </div>
  )
}
