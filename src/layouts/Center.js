import styled, { css } from 'styled-components';

const Center = styled.div.attrs((props) => ({
  $centerVertically: props.$vertically || false,
}))`
  display: flex;
  flex-direction: column;
  align-items: center;

  ${({ $centerVertically }) =>
    $centerVertically
      ? css`
          justify-content: center;
          height: 100%;
        `
      : css`
          margin-top: 100px;
        `}
`;

export default Center;
