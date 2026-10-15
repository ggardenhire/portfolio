import { useState } from 'react'
import { Clock } from './components/Clock'
import { resume } from './data/resume'
import {
  AboutSection,
  CertificationsSection,
  ContactSection,
  EducationSection,
  ExperienceSection,
  LeadershipSection,
  SkillsSection,
} from './sections'

const TABS = [
  { id: 'about', label: 'About', render: () => <AboutSection /> },
  { id: 'skills', label: 'Skills', render: () => <SkillsSection /> },
  { id: 'experience', label: 'Experience', render: () => <ExperienceSection /> },
  { id: 'leadership', label: 'Leadership', render: () => <LeadershipSection /> },
  { id: 'education', label: 'Education', render: () => <EducationSection /> },
  { id: 'certs', label: 'Certifications', render: () => <CertificationsSection /> },
  { id: 'contact', label: 'Contact', render: () => <ContactSection /> },
] as const

type TabId = (typeof TABS)[number]['id']

export default function App() {
  const [active, setActive] = useState<TabId>('about')
  const current = TABS.find((t) => t.id === active) ?? TABS[0]

  return (
    <div className="desktop">
      <header className="hero">
        <div className="hero__inner">
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

      <main className="stage">{current.render()}</main>

      <footer className="taskbar">
        <button className="taskbar__start">
          <span className="taskbar__logo" aria-hidden="true">
            ▚
          </span>
          Start
        </button>
        <div className="taskbar__window">{current.label}</div>
        <Clock />
      </footer>
    </div>
  )
}
