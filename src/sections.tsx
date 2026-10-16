import { Window } from './components/Window'
import { resume } from './data/resume'

export function AboutSection() {
  return (
    <Window title="about.txt — Notepad" status={`${resume.name} · ${resume.title}`}>
      <div className="prose">
        <p className="prose__lead">{resume.summary}</p>
      </div>
      {resume.photos.length > 0 && (
        <div className="gallery">
          {resume.photos.map((photo) => (
            <figure className="gallery__item" key={photo.src}>
              <img className="gallery__img" src={photo.src} alt={photo.alt} loading="lazy" />
              {photo.caption && <figcaption className="gallery__caption">{photo.caption}</figcaption>}
            </figure>
          ))}
        </div>
      )}
    </Window>
  )
}

export function SkillsSection() {
  return (
    <Window title="Skills" status={`${resume.skills.length} categories`}>
      <div className="terminal">
        {resume.skills.map((group) => (
          <div className="terminal__block" key={group.category}>
            <div className="terminal__prompt">
              <span className="terminal__cue">C:\skills&gt;</span> dir /{group.category}
            </div>
            <ul className="chiplist">
              {group.items.map((item) => (
                <li className="chip" key={item}>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
        <div className="terminal__prompt">
          <span className="terminal__cue">C:\skills&gt;</span>
          <span className="terminal__cursor">_</span>
        </div>
      </div>
    </Window>
  )
}

function ExperienceList({ entries }: { entries: typeof resume.experience }) {
  return (
    <div className="xp">
      {entries.map((job) => (
        <article className="xp__item" key={`${job.company}-${job.role}`}>
          <header className="xp__head">
            <h3 className="xp__role">{job.role}</h3>
            <div className="xp__meta">
              <span className="xp__company">{job.company}</span>
              <span className="xp__period">{job.period}</span>
            </div>
            {job.location && <span className="xp__loc">{job.location}</span>}
          </header>
          <ul className="xp__bullets">
            {job.highlights.map((h, i) => (
              <li key={i}>{h}</li>
            ))}
          </ul>
        </article>
      ))}
    </div>
  )
}

export function ExperienceSection() {
  return (
    <Window title="experience — Explorer" status={`${resume.experience.length} position(s)`}>
      <ExperienceList entries={resume.experience} />
    </Window>
  )
}

export function ProjectsSection() {
  return (
    <Window title="projects — My Computer" status={`${resume.projects.length} project(s)`}>
      <div className="cards">
        {resume.projects.map((project) => (
          <article className="project" key={project.name}>
            <h3 className="project__name">{project.name}</h3>
            <p className="project__blurb">{project.blurb}</p>
            <ul className="chiplist chiplist--light">
              {project.tags.map((tag) => (
                <li className="chip chip--light" key={tag}>
                  {tag}
                </li>
              ))}
            </ul>
            <div className="project__links">
              {project.liveUrl && (
                <a
                  className="link-button"
                  href={project.liveUrl}
                  target="_blank"
                  rel="noreferrer noopener"
                >
                  Live site →
                </a>
              )}
              {project.repoUrl && (
                <a
                  className="link-button"
                  href={project.repoUrl}
                  target="_blank"
                  rel="noreferrer noopener"
                >
                  Source →
                </a>
              )}
            </div>
          </article>
        ))}
      </div>
    </Window>
  )
}

export function LeadershipSection() {
  return (
    <Window title="leadership — Explorer">
      <ExperienceList entries={resume.leadership} />
    </Window>
  )
}

export function EducationSection() {
  return (
    <Window title="education.doc">
      <div className="cards">
        {resume.education.map((ed) => (
          <div className="card" key={ed.school}>
            <h3 className="card__title">{ed.school}</h3>
            <p className="card__sub">{ed.degree}</p>
            <p className="card__period">{ed.period}</p>
            {ed.notes && (
              <ul className="card__notes">
                {ed.notes.map((n) => (
                  <li key={n}>{n}</li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </Window>
  )
}

export function CertificationsSection() {
  return (
    <Window title="certifications" status={`${resume.certifications.length} active`}>
      <ul className="certs">
        {resume.certifications.map((c) => (
          <li className="cert" key={c.name}>
            <span className="cert__badge" aria-hidden="true">
              ✔
            </span>
            <span className="cert__name">{c.name}</span>
            {c.issuer && <span className="cert__issuer">{c.issuer}</span>}
          </li>
        ))}
      </ul>
    </Window>
  )
}

export function ContactSection() {
  return (
    <Window title="contact — Dial-Up Networking">
      <div className="contact">
        <p className="contact__line">
          Want to talk platforms, security, or automation? Drop me a line.
        </p>
        <ul className="contact__links">
          {resume.links.map((l) => (
            <li key={l.href}>
              <a className="link-button" href={l.href} target="_blank" rel="noreferrer noopener">
                {l.label} →
              </a>
            </li>
          ))}
        </ul>
      </div>
    </Window>
  )
}
