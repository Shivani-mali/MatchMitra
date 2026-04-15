const Footer = () => {
  return (
    <footer className="border-t border-slate-200 bg-white/90">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-center px-4 py-4 text-center">
        <p className="text-sm font-medium text-slate-600">
          © {new Date().getFullYear()} All rights are reserved by the MatchMitra.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
