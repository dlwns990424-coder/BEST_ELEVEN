import footballField from "../../../../../img/football_field.jpg";

import { FORMATIONS } from "../../../../data/formations";

import PlayerSlot from "./PlayerSlot";

export default function FormationField({ formation, placedPlayers }) {
  const slots = FORMATIONS[formation] ?? [];

  return (
    <section className="mt-5">
      <div className="relative aspect-[3/4] w-full overflow-hidden rounded-xl">
        <img
          src={footballField}
          alt="축구장"
          draggable={false}
          className="pointer-events-none absolute inset-0 h-full w-full object-fill"
        />

        {slots.map((slot) => (
          <PlayerSlot
            key={slot.id}
            slotId={slot.id}
            type={slot.type}
            label={slot.label}
            className={slot.className}
            player={placedPlayers[slot.id] ?? null}
          />
        ))}
      </div>
    </section>
  );
}
