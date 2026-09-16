import React from 'react';
import styled from 'styled-components';

const Loader = ({
  message = 'Loading MatchMitra...',
  showText = true,
  fullScreen = true,
  className = '',
}) => {
  return (
    <StyledWrapper
      className={`${
        fullScreen
          ? 'fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-md'
          : 'flex min-h-[220px] items-center justify-center p-6'
      } ${className}`}
      role="status"
      aria-live="polite"
    >
      <div className="loader-box flex flex-col items-center justify-center p-8 rounded-3xl bg-white shadow-2xl border border-rose-100/80">
        <div className="loader-heart-wrapper">
          <div className="loader" />
          <div className="heart-core">
            <svg viewBox="0 0 24 24" className="heart-icon">
              <path
                fill="currentColor"
                d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
              />
            </svg>
          </div>
        </div>

        {showText && <p className="loader-text">{message}</p>}
      </div>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  .loader-box {
    position: relative;
    max-width: 280px;
    width: 100%;
    box-shadow: 0 20px 40px -15px rgba(244, 63, 94, 0.15);
  }

  .loader-heart-wrapper {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 90px;
    height: 90px;
  }

  .loader {
    height: 14px;
    aspect-ratio: 4;
    --_g: no-repeat radial-gradient(farthest-side, #e11d48 90%, #be123c);
    background:
      var(--_g) left,
      var(--_g) right;
    background-size: 25% 100%;
    display: grid;
    position: absolute;
    width: 80px;
  }

  .loader:before,
  .loader:after {
    content: "";
    height: inherit;
    aspect-ratio: 1;
    grid-area: 1/1;
    margin: auto;
    border-radius: 50%;
    transform-origin: -100% 50%;
    background: linear-gradient(135deg, #e11d48 0%, #f43f5e 100%);
    box-shadow: 0 0 10px rgba(225, 29, 72, 0.5);
    animation: l49 1s infinite linear;
  }

  .loader:after {
    transform-origin: 200% 50%;
    --s: -1;
    animation-delay: -0.5s;
    background: linear-gradient(135deg, #be123c 0%, #e11d48 100%);
    box-shadow: 0 0 10px rgba(190, 18, 60, 0.5);
  }

  .heart-core {
    z-index: 2;
    display: flex;
    align-items: center;
    justify-content: center;
    animation: heartPulse 1.2s ease-in-out infinite alternate;
  }

  .heart-icon {
    width: 28px;
    height: 28px;
    color: #e11d48;
    filter: drop-shadow(0 0 8px rgba(225, 29, 72, 0.6));
  }

  .loader-text {
    margin-top: 1.25rem;
    font-size: 0.875rem;
    font-weight: 700;
    color: #be123c;
    letter-spacing: 0.025em;
    text-align: center;
    animation: textFade 1.5s ease-in-out infinite alternate;
  }

  @keyframes l49 {
    58%,
    100% {
      transform: rotate(calc(var(--s, 1) * 1turn));
    }
  }

  @keyframes heartPulse {
    0% {
      transform: scale(0.85);
      filter: drop-shadow(0 0 4px rgba(225, 29, 72, 0.4));
    }
    100% {
      transform: scale(1.18);
      filter: drop-shadow(0 0 14px rgba(225, 29, 72, 0.9));
    }
  }

  @keyframes textFade {
    0% {
      opacity: 0.6;
    }
    100% {
      opacity: 1;
    }
  }
`;

export default Loader;
