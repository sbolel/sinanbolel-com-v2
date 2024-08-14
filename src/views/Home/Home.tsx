import React from 'react'

const Home: React.FC = () => {
  return (
    <div className="hero-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
      <img className="logo" src="assets/img/sinan-bolel-headshot-2023.png" alt="Sinan Bolel" style={{ height: '18em', width: '18em' }} />
      <h1 className="title">Sinan Bolel</h1>
      <h2 className="subtitle">
        Principal
        <span className="separator visible-xs visible-s"><br /></span>
        Software Engineer (UX)
      </h2>
      <section className="connections" style={{ display: 'flex', gap: '1rem' }}>
        <a id="a-resume" className="md-button md-fab md-raised md-button-shrink" href="https://sinanbolel.com/resume" target="_blank" aria-label="Resume">
          <div className="md-font ion-logo ion-logo-resume"></div>
        </a>
        <a id="a-linkedin" className="md-button md-fab md-raised md-button-shrink" href="https://sinanbolel.com/linkedin" target="_blank" aria-label="LinkedIn">
          <div className="md-font ion-logo ion-logo-linkedin"></div>
        </a>
        <a id="a-github" className="md-button md-fab md-raised md-button-shrink" href="https://sinanbolel.com/github" target="_blank" aria-label="GitHub">
          <div className="md-font ion-logo ion-logo-github"></div>
        </a>
        <a id="a-stackoverflow" className="md-button md-fab md-raised md-button-shrink" href="https://sinanbolel.com/stackoverflow" target="_blank" aria-label="StackOverflow">
          <div className="md-font ion-logo ion-logo-stackoverflow"></div>
        </a>
      </section>
    </div>
  )
}

export default Home
