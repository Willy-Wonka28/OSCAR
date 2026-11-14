# OSCAR (Observatory for SPHEREx Celestial Astrometry & Real-time Comparison)*

Built for the NASA Space Apps Hackathon.

OSCAR is a high-precision, web-based astronomical blink comparator built on real multi-epoch infrared sky surveys from NASA SPHEREx.

Inspired by Clyde Tombaugh's optical comparator that discovered Pluto in 1930, OSCAR modernizes time-domain astronomy for 21st-century infrared space telescope surveys.

### Highlights

- **Blink Comparator Engine**: Toggles aligned multi-epoch infrared frames to reveal celestial motion and variable star flux swings in real time.
- **Targeted Coordinate Cutouts (vs Heavy Raw FITS)**: Instead of forcing the browser to download massive gigabyte-scale raw FITS files, OSCAR fetches lightweight, server-cropped coordinate cutouts. This slashes data payloads by 99.9% (from 50MB+ down to ~25KB per frame) for instantaneous, zero-lag blinking.
- **Magnified Motion Lens**: Picture-in-picture dynamic tracker that isolates moving candidates and amplifies sub-pixel drift.
- **Dual Observation Profiles**:
  - **Noob Mode**: Fast, zero-jargon discovery interface with continuous playback and intuitive motion badges.
  - **Nerd Mode**: Deep telemetry sidebar featuring proper motion vectors, tangential velocity estimates, Red/Cyan epoch composites, and direct NASA TAP SQL queries.
- **Live NASA TAP Integration**: Connects to NASA IPAC/IRSA TAP services to query real mission observation IDs, MJDs, exposure durations, and sky coordinates.
- **Instrument-Grade Dark UI**: Space-black workstation interface engineered with pure vector graphics, procedural cosmos effects, and zero heavy image bloat.

## * = [Yeah, Gemini just came up with that one]. I named it after Oscar Isaac AKA MoonKnight