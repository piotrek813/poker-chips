function SelectPlayers({ players, selectedPlayers, selectPlayer, closeModal }) {
  return (
    <div className="select-players-modal">
      <div className="select-players">
        {players.map((p) => (
          // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions
          <img
            key={`${p.id}select`}
            src={p.photoURL}
            alt={p.disaplayName}
            onClick={() => selectPlayer(p)}
            className={
              selectedPlayers.some((e) => e.id === p.id)
                ? 'player-selected'
                : 'id'
            }
          />
        ))}
      </div>

      <button type="button" onClick={closeModal}>
        M&apos;key
      </button>
    </div>
  );
}

export default SelectPlayers;
