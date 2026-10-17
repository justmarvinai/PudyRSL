import { Link } from 'react-router'

export function NotFound() {
  return (
    <div className="grid min-h-[60vh] place-items-center">
      <div className="text-center">
        <div className="t-label text-low">Error 404</div>
        <h1 className="t-display mt-4 text-[clamp(3rem,9vw,6.5rem)] text-hi">Lost in the campaign</h1>
        <p className="mt-4 text-[0.95rem] text-mid">This page isn&apos;t part of your guide.</p>
        <Link to="/" className="btn btn-primary mt-8 h-10 px-5">
          Back to the dashboard
        </Link>
      </div>
    </div>
  )
}
