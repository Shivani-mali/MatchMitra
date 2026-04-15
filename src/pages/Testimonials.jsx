import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useLanguage } from '../context/LanguageContext';

const testimonials = [
  {
    name: 'Aarav & Meera',
    title: 'Matched with trust',
    comment:
      'MatchMitra made it simple to find compatible profiles. The trust score and verified badge gave us confidence from day one.',
  },
  {
    name: 'Priya Sharma',
    title: 'Safe and easy',
    comment:
      'I liked the clean interface, quick interest flow, and the chat system. It feels professional and secure.',
  },
  {
    name: 'Rahul Verma',
    title: 'Great experience',
    comment:
      'The filters and profile details helped me shortlist faster. The app feels modern and easy to use.',
  },
  {
    name: 'Sneha & Karan',
    title: 'Real-time chat works well',
    comment:
      'As soon as we accepted the interest, the chat opened instantly. That smooth flow is what impressed us most.',
  },
];

const Marquee = ({ children, reverse = false, pauseOnHover = false, repeat = 4 }) => (
  <div className="group flex gap-4 overflow-hidden p-2 [--duration:30s]">
    {Array.from({ length: repeat }).map((_, index) => (
      <div
        key={index}
        className={`flex min-w-full shrink-0 gap-4 ${reverse ? 'animate-[marquee-reverse_var(--duration)_linear_infinite]' : 'animate-[marquee_var(--duration)_linear_infinite]'} ${pauseOnHover ? 'group-hover:[animation-play-state:paused]' : ''}`}
      >
        {children}
      </div>
    ))}
  </div>
);

const TestimonialCard = ({ item }) => (
  <article className="w-[320px] rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
    <p className="text-sm font-semibold text-indigo-600">{item.title}</p>
    <p className="mt-3 text-base font-semibold text-slate-900">{item.name}</p>
    <p className="mt-2 text-sm leading-6 text-slate-600">{item.comment}</p>
  </article>
);

const Testimonials = () => {
  const { t } = useLanguage();
  return (
    <div className="min-h-screen bg-slate-100">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-6 md:px-6">
        <section className="rounded-3xl border border-slate-200 bg-white px-5 py-6 shadow-sm md:px-6 md:py-8">
          <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600">{t('nav.testimonials')}</p>
          <h1 className="mt-2 text-3xl font-bold text-slate-900">What happy couples and users say</h1>
          <p className="mt-2 max-w-3xl text-sm text-slate-500">
            A simple wall of comments to show trust, satisfaction, and real user experiences.
          </p>

          <div className="mt-6 space-y-4">
            <Marquee pauseOnHover repeat={3}>
              {testimonials.map((item) => (
                <TestimonialCard key={item.name} item={item} />
              ))}
            </Marquee>
            <Marquee reverse pauseOnHover repeat={3}>
              {testimonials.slice().reverse().map((item) => (
                <TestimonialCard key={`${item.name}-reverse`} item={item} />
              ))}
            </Marquee>
          </div>
        </section>

        <section className="mt-6 grid gap-4 md:grid-cols-2">
          {testimonials.map((item) => (
            <article key={item.name} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="font-semibold text-slate-900">{item.name}</h2>
                  <p className="text-sm text-slate-500">{item.title}</p>
                </div>
                <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                  Satisfied
                </span>
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-600">{item.comment}</p>
            </article>
          ))}
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Testimonials;