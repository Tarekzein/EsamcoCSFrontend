import logoColor from '../../../assets/logo-color.png'
import { navigate } from '../../../router/navigation'

export function AuthShell({ children, variant = 'split', showBackButton = true }) {
  const isSplit = variant === 'split'
  const shellClass = isSplit
    ? 'relative grid min-h-svh overflow-hidden bg-brand-surface font-sans text-brand-navy lg:grid-cols-[minmax(0,1fr)_minmax(440px,0.92fr)]'
    : 'relative grid min-h-svh place-items-center overflow-hidden bg-brand-surface px-6 py-16 font-sans text-brand-navy max-sm:px-3 max-sm:py-24'

  return (
    <main className={shellClass} dir="rtl">
      <Logo />
      {showBackButton && <BackButton />}
      {isSplit ? (
        <>
          <section className="grid content-center justify-items-center gap-9 px-12 pt-36 pb-18 max-lg:min-h-0 max-lg:px-6 max-lg:pt-32 max-lg:pb-8">
            <div className="grid max-w-[460px] gap-4 text-center">
              <span className="mx-auto inline-flex w-fit rounded-full border border-brand-primary/15 bg-white/70 px-4 py-2 text-sm font-black text-brand-primary">
                ESAMCO Customer Support
              </span>
              <h1 className="m-0 text-[42px] leading-tight font-black text-brand-navy max-sm:text-[32px]">
                مرحباً بك!
              </h1>
              <p className="m-0 text-xl leading-8 font-bold text-brand-gray max-sm:text-[18px]">
                سجل الدخول للمتابعة و إدارة دعم العملاء بسهولة.
              </p>
            </div>
            <SupportIllustration />
            <div className="grid w-full max-w-[520px] grid-cols-3 gap-3 text-center max-sm:grid-cols-1">
              <div className="rounded-lg border border-brand-gray/20 bg-white/75 px-4 py-3">
                <p className="m-0 text-sm font-bold text-brand-gray">متابعة</p>
                <strong className="text-lg text-brand-navy">فورية</strong>
              </div>
              <div className="rounded-lg border border-brand-gray/20 bg-white/75 px-4 py-3">
                <p className="m-0 text-sm font-bold text-brand-gray">حماية</p>
                <strong className="text-lg text-brand-navy">مؤمنة</strong>
              </div>
              <div className="rounded-lg border border-brand-gray/20 bg-white/75 px-4 py-3">
                <p className="m-0 text-sm font-bold text-brand-gray">إدارة</p>
                <strong className="text-lg text-brand-navy">منظمة</strong>
              </div>
            </div>
          </section>
          <section className="grid min-h-svh content-center border-r border-brand-gray/15 bg-white px-[70px] pt-30 pb-16 max-lg:min-h-0 max-lg:border-r-0 max-lg:px-6 max-lg:py-10">
            {children}
          </section>
        </>
      ) : (
        <section className="grid min-h-[min(820px,calc(100svh-128px))] w-full max-w-[680px] content-center rounded-lg border border-brand-gray/15 bg-white px-10 py-[74px] shadow-[0_22px_60px_rgba(17,45,95,0.1)] max-sm:min-h-0 max-sm:px-4 max-sm:py-10">
          {children}
        </section>
      )}
    </main>
  )
}

function BackButton() {
  function handleBack() {
    const currentPath = window.location.pathname.replace(/\/+$/, '') || '/login'

    if (currentPath !== '/login' && currentPath !== '/') {
      navigate('/login')
      return
    }

    if (window.history.length > 1) {
      window.history.back()
    }
  }

  return (
    <button
      type="button"
      className="absolute top-9 right-9 z-10 inline-flex min-h-11 items-center gap-2 rounded-lg border border-brand-gray/20 bg-white/85 px-4 text-sm font-black text-brand-gray shadow-[0_10px_25px_rgba(17,45,95,0.08)] transition hover:-translate-y-px hover:border-brand-primary/30 hover:bg-white hover:text-brand-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary max-lg:top-6 max-lg:right-6 max-sm:top-4 max-sm:right-4"
      onClick={handleBack}
      aria-label="رجوع"
    >
      <svg className="size-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M9 5l7 7-7 7"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span>رجوع</span>
    </button>
  )
}

export function Logo({ compact = false }) {
  const wrapperClass = compact
    ? 'inline-flex items-center text-brand-gray no-underline'
    : 'absolute top-9 left-9 z-10 inline-flex items-center text-brand-gray no-underline max-lg:top-6 max-lg:left-6 max-sm:top-4 max-sm:left-4'
  const imgClass = compact ? 'h-14 w-auto' : 'h-24 w-auto max-sm:h-16'

  return (
    <a className={wrapperClass} href="/login" aria-label="ESAMCO Group">
      <img src={logoColor} alt="ESAMCO Group" className={imgClass} />
    </a>
  )
}

export function SupportIllustration() {
  return (
    <svg
      className="h-auto w-[min(82vw,560px)] max-lg:w-[min(100%,420px)]"
      viewBox="0 0 560 452"
      role="img"
      aria-label="دعم العملاء"
    >
      <ellipse cx="295" cy="280" rx="205" ry="130" fill="#F4EFEF" />
      <circle cx="520" cy="188" r="7" fill="#2678E0" />
      <circle cx="70" cy="220" r="8" fill="#2678E0" />
      <path d="M77 330c-14-46 14-81 35-61 16 15 3 38-35 61Z" fill="#2fa86a" />
      <path d="M110 330c-5-58 32-94 47-66 12 23-8 45-47 66Z" fill="#37be7d" />
      <path d="M130 334c16-49 56-64 61-34 4 24-20 37-61 34Z" fill="#1f9f62" />
      <path d="M91 334h74l-10 58H101l-10-58Z" fill="#d99525" />
      <path d="M88 328h80v14H88z" rx="7" fill="#e6b844" />
      <path d="M192 329h286l20 28H166l26-28Z" fill="#2678E0" />
      <rect x="212" y="201" width="230" height="145" rx="14" fill="#2678E0" />
      <rect x="227" y="216" width="200" height="112" rx="7" fill="#ffffff" />
      <path d="m260 276 35-35 48 21 38-52" fill="none" stroke="#124AA9" strokeWidth="10" />
      <rect x="270" y="292" width="22" height="26" rx="4" fill="#124AA9" />
      <rect x="307" y="274" width="22" height="44" rx="4" fill="#124AA9" />
      <rect x="344" y="254" width="22" height="64" rx="4" fill="#124AA9" />
      <path d="M219 188c8-89 149-92 158-3" fill="none" stroke="#073487" strokeWidth="24" />
      <path d="M212 206c0-20 13-38 29-38h12v82h-14c-15 0-27-18-27-44Z" fill="#124AA9" />
      <path d="M356 168h13c16 0 29 18 29 38s-12 44-27 44h-15v-82Z" fill="#124AA9" />
      <path d="M365 250c-20 28-58 34-90 18" fill="none" stroke="#073487" strokeWidth="11" strokeLinecap="round" />
      <path d="M94 130c28-40 93-40 120 0 27 40-5 91-60 91-13 0-26-3-37-8l-45 23 18-42c-20-18-21-43 4-64Z" fill="#2678E0" />
      <circle cx="127" cy="174" r="7" fill="#ffffff" />
      <circle cx="155" cy="174" r="7" fill="#ffffff" />
      <circle cx="183" cy="174" r="7" fill="#ffffff" />
    </svg>
  )
}

export function MailIllustration({ tone = 'blue' }) {
  const isGreen = tone === 'green'
  const primary = isGreen ? '#18bf49' : '#124AA9'
  const secondary = isGreen ? '#35d85d' : '#2678E0'
  const soft = isGreen ? '#e4f8e8' : '#F4EFEF'

  return (
    <svg className="mx-auto h-42 w-52" viewBox="0 0 210 168" aria-hidden="true">
      <path d="M42 42c26-43 95-42 122 0 32 50-1 113-62 112-65-1-93-59-60-112Z" fill={soft} />
      <path d="m125 36 66-25-29 78-23-29-35-8 21-16Z" fill={secondary} />
      <rect x="42" y="76" width="126" height="78" rx="5" fill={primary} />
      <path d="m42 76 63 43 63-43v78H42V76Z" fill={secondary} opacity=".7" />
      <path d="m42 154 63-48 63 48H42Z" fill={primary} opacity=".9" />
      <rect x="76" y="48" width="66" height="48" rx="4" fill="#ffffff" />
      <circle cx="59" cy="74" r="17" fill={primary} />
      <text x="59" y="81" textAnchor="middle" fontSize="21" fontWeight="900" fill="#fff">
        {isGreen ? '✓' : '@'}
      </text>
    </svg>
  )
}

export function LockIllustration() {
  return (
    <svg className="mx-auto h-42 w-52" viewBox="0 0 210 168" aria-hidden="true">
      <path d="M37 37c30-40 97-38 125 4 35 53-2 114-65 113-61-1-94-65-60-117Z" fill="#e4f8e8" />
      <path d="M68 83V67c0-28 18-48 43-48s43 20 43 48v16" fill="none" stroke="#22bd4f" strokeWidth="15" strokeLinecap="round" />
      <rect x="58" y="75" width="106" height="82" rx="18" fill="#22bd4f" />
      <circle cx="111" cy="112" r="14" fill="#fff" />
      <path d="M105 123h12l6 23H99l6-23Z" fill="#fff" />
      <circle cx="163" cy="132" r="30" fill="#36c760" stroke="#fff" strokeWidth="7" />
      <path d="m150 132 9 9 18-22" fill="none" stroke="#fff" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function PasswordToggle({ isVisible, onClick }) {
  return (
    <button
      type="button"
      className="absolute top-1/2 left-3 grid size-11 -translate-y-1/2 place-items-center rounded-full text-brand-gray transition hover:bg-brand-gray/8 hover:text-brand-primary"
      onClick={onClick}
      aria-label={isVisible ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
    >
      <svg className="size-7" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
        {!isVisible ? (
          <path d="M4 20 20 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        ) : null}
      </svg>
    </button>
  )
}

export function FieldError({ children }) {
  if (!children) {
    return null
  }

  return (
    <p className="m-0 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-right text-base leading-relaxed font-bold text-red-700">
      {children}
    </p>
  )
}

export function FormAlert({ children, tone = 'error' }) {
  if (!children) {
    return null
  }

  const toneClass =
    tone === 'warning'
      ? 'border-amber-200 bg-amber-50 text-amber-700'
      : tone === 'success'
        ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
        : 'border-transparent bg-transparent text-brand-gray'

  return <p className={`m-0 rounded-lg border px-4 py-3 text-center text-base leading-relaxed font-bold ${toneClass}`}>{children}</p>
}
