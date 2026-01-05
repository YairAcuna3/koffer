import { TbWorld } from "react-icons/tb";
import { IoGameController } from "react-icons/io5";
import { BsPcDisplayHorizontal } from "react-icons/bs";
import { MdOutlinePhoneAndroid } from "react-icons/md";
import { HiWrenchScrewdriver, HiMiniAcademicCap } from "react-icons/hi2";
import { GrBook } from "react-icons/gr";
import { FaBookOpen } from "react-icons/fa6";
import { FaQuestionCircle } from "react-icons/fa";
import { SiComicfury } from "react-icons/si";
import { IconType } from "react-icons";

export const PROJECT_STATES = [
  "Actualizar",
  "Terminado",
  "Activo",
  "Pausado",
  "Cancelado",
  "Sin iniciar",
] as const;

export const STATE_COLORS: Record<string, string> = {
  Actualizar: "bg-state-actualizar",
  Terminado: "bg-state-terminado",
  Activo: "bg-state-activo",
  Pausado: "bg-state-pausado",
  Cancelado: "bg-state-cancelado",
  "Sin iniciar": "bg-state-sin-iniciar",
};

export const PROJECT_TYPES = [
  "Web",
  "Videojuego",
  "App PC",
  "Móvil",
  "Mod",
  "Libro",
  "Cómic",
  "Animation",
  "Académico",
  "Otro",
] as const;

// Mapeo de tipos a íconos - fácil de modificar o extender
export const PROJECT_TYPE_ICONS: Record<string, IconType> = {
  Web: TbWorld,
  Videojuego: IoGameController,
  "App PC": BsPcDisplayHorizontal,
  Móvil: MdOutlinePhoneAndroid,
  Mod: HiWrenchScrewdriver,
  Libro: GrBook,
  Cómic: FaBookOpen,
  Animation: SiComicfury,
  Académico: HiMiniAcademicCap,
  Otro: FaQuestionCircle,
};

// Ícono por defecto cuando no hay tipo o no se encuentra
export const DEFAULT_PROJECT_ICON = FaQuestionCircle;

export type ProjectState = (typeof PROJECT_STATES)[number];
export type ProjectType = (typeof PROJECT_TYPES)[number];
