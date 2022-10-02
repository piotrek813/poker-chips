import styled from 'styled-components';

function Spinner() {
  return (
    <Wrapper>
      <StyledSpinner viewBox="0 0 50 50">
        <circle
          className="path"
          cx="25"
          cy="25"
          r="20"
          fill="none"
          strokeWidth="2"
        />
      </StyledSpinner>
    </Wrapper>
  );
}

const Wrapper = styled.div`
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
`;

const StyledSpinner = styled.svg`
  animation: rotate 1s linear infinite;
  width: 40vw;
  height: 40vw;

  & .path {
    stroke: var(--c-white-1);
    stroke-linecap: round;
    animation: dash 1.5s ease-in-out infinite;
  }

  @keyframes rotate {
    100% {
      transform: rotate(360deg);
    }
  }
  @keyframes dash {
    0% {
      stroke-dasharray: 1, 150;
      stroke-dashoffset: 0;
    }
    50% {
      stroke-dasharray: 90, 150;
      stroke-dashoffset: -35;
    }
    100% {
      stroke-dasharray: 90, 150;
      stroke-dashoffset: -124;
    }
  }
`;

export default Spinner;
