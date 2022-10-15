import { createGlobalStyle } from 'styled-components';

const GlobalStyle = createGlobalStyle`
  :root {
  --c-dark-1: #4b4b5a;
  --c-black-1: #292933;

  --c-white-1: #E1E1EE;
  --c-white-2: #FFF3F4;
  --c-white-3: #ffffff;

  --c-red-1: #FF6464;

  --c-purple-1: #5B5BBC;
  --c-grey-1: #58586D;
  --c-grey-2: #7979AF;

  --body-padding: 20px 20px;

  --font-size-label: 30px;
  --font-size-heading-medium: 30px;
  --font-weight-medium: 500;
  --font-weight-bold: 700;
  --font-weight-black: 900;

  --box-shadow-button: 4px 4px 20px rgb(0 0 0 / 20%);
  }

  * {
    box-sizing: border-box;
  }

  body {
    margin: 0;
    font-family: 'Poppins';
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    width: 100vw;
    height: 100vh;
    padding: var(--body-padding);
    background: var(--c-dark-1);
    color: var(--c-white-1);
  }

  #root {
    height: 100%;

    @media(min-width: 768px) {
      width: 50%;
      margin: auto;
    }
  }

  input, button {
    font-family: inherit;
    /* -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale; */
  }

`;

function Wrapper({ center, children }) {
  return (
    <>
      {children}
      <GlobalStyle />
    </>
  );
}

export default Wrapper;
