/* eslint-disable no-duplicate-case */
import styled, { css } from 'styled-components';
import { ReactComponent as Logo } from '../images/logo.svg';

function Table({ players }) {
  return (
    <StyledTable>
      <StyledLogo />
      {players.map((p, i) => (
        <PlayerOuter key={p.id} $position={i}>
          <PlayerInner>
            <Avatar
              src={
                p.photoURL ||
                `https://metal-archives.com/images/cats/${Math.floor(
                  Math.random() * 100 + 1,
                )}.jpg`
              }
              alt={`${p.displayName} avatar`}
              referrerPolicy="no-referer"
            />
            <Bankroll>{p.bankroll}</Bankroll>
          </PlayerInner>
          {p.currentContribution}
        </PlayerOuter>
      ))}
    </StyledTable>
  );
}

const StyledTable = styled.div`
  background: #68bc5b;
  height: 293px;
  border-radius: 28px;
  border: 8px solid #7b543f;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  margin-bottom: 68px;
`;

const StyledLogo = styled(Logo)`
  width: 41%;
  opacity: 12%;
  & path {
    fill: #edf8eb;
  }
`;

const PlayerOuter = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;
  justify-content: center;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);

  ${({ $position }) => {
    const styles = {
      flexDirection: '',
      top: '',
      left: '',
      translateX: '',
      translateY: '',
    };
    switch ($position) {
      case 0:
        styles.flexDirection = 'column';
        styles.top = '0';
        styles.translateY = '10%';
        break;
      case 1:
      case 2:
      case 3:
        styles.flexDirection = 'row-reverse';
        styles.left = '100%';
        styles.translateX = '-20%';
        break;
      case 4:
      case 5:
      case 6:
        styles.flexDirection = 'row';
        styles.left = '0';
        styles.translateX = '20%';
        break;
      case 7:
        styles.flexDirection = 'column-reverse';
        styles.top = '100%';
        styles.translateY = '-10%';
        break;
      default:
        return '';
    }
    switch ($position) {
      case 1:
      case 4:
        styles.top = '0';
        styles.translateY = '70%';
        break;
      case 3:
      case 6:
        styles.top = '100%';
        styles.translateY = '-70%';
        break;

      default:
        break;
    }
    return css`
      flex-direction: ${styles.flexDirection};
      top: ${styles.top};
      left: ${styles.left};
      translate: ${styles.translateX} ${styles.translateY};
    `;
  }}
`;

const PlayerInner = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

const Avatar = styled.img`
  width: 44px;
  height: 44px;
  border-radius: 50%;
`;

const Bankroll = styled.span`
  font-size: 14px;
  background: #b5724e;
  border-radius: 4px;
  line-height: 21px;
  padding: 1px 11px;
  margin-top: -11px;
`;

export default Table;
