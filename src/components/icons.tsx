// Phosphor icons in bold/duotone weights: chunkier and more characterful
// than hairline strokes, and readable at small sizes on phones.
import type { ComponentType } from "react"
import type { IconProps } from "@phosphor-icons/react"
import { ArrowCounterClockwise } from "@phosphor-icons/react/dist/csr/ArrowCounterClockwise"
import { ArrowLeft as PArrowLeft } from "@phosphor-icons/react/dist/csr/ArrowLeft"
import { ArrowRight as PArrowRight } from "@phosphor-icons/react/dist/csr/ArrowRight"
import { Brain } from "@phosphor-icons/react/dist/csr/Brain"
import { CaretRight } from "@phosphor-icons/react/dist/csr/CaretRight"
import { ChartBar } from "@phosphor-icons/react/dist/csr/ChartBar"
import { Check as PCheck } from "@phosphor-icons/react/dist/csr/Check"
import { Cloud as PCloud } from "@phosphor-icons/react/dist/csr/Cloud"
import { CloudSlash } from "@phosphor-icons/react/dist/csr/CloudSlash"
import { Fire } from "@phosphor-icons/react/dist/csr/Fire"
import { GearSix } from "@phosphor-icons/react/dist/csr/GearSix"
import { House } from "@phosphor-icons/react/dist/csr/House"
import { Info as PInfo } from "@phosphor-icons/react/dist/csr/Info"
import { MapTrifold } from "@phosphor-icons/react/dist/csr/MapTrifold"
import { Pause as PPause } from "@phosphor-icons/react/dist/csr/Pause"
import { Play as PPlay } from "@phosphor-icons/react/dist/csr/Play"
import { Plus as PPlus } from "@phosphor-icons/react/dist/csr/Plus"
import { SignOut } from "@phosphor-icons/react/dist/csr/SignOut"
import { Sparkle } from "@phosphor-icons/react/dist/csr/Sparkle"
import { Target } from "@phosphor-icons/react/dist/csr/Target"
import { Trash } from "@phosphor-icons/react/dist/csr/Trash"
import { X as PX } from "@phosphor-icons/react/dist/csr/X"

type Props = { size?: number; strokeWidth?: number; className?: string }

const make = (Icon: ComponentType<IconProps>, weight: IconProps["weight"] = "bold") =>
  function ZenithIcon({ size = 18, className }: Props) {
    return <Icon size={size} weight={weight} className={className} aria-hidden />
  }

export const ArrowLeft = make(PArrowLeft)
export const ArrowRight = make(PArrowRight)
export const BarChart3 = make(ChartBar, "duotone")
export const BrainCircuit = make(Brain, "duotone")
export const Check = make(PCheck)
export const ChevronRight = make(CaretRight)
export const CircleDot = make(Target, "duotone")
export const Cloud = make(PCloud, "duotone")
export const CloudOff = make(CloudSlash, "duotone")
export const Flame = make(Fire, "fill")
export const Home = make(House, "duotone")
export const Info = make(PInfo, "duotone")
export const LogOut = make(SignOut)
export const Map = make(MapTrifold, "duotone")
export const Pause = make(PPause, "fill")
export const Play = make(PPlay, "fill")
export const Plus = make(PPlus)
export const RotateCcw = make(ArrowCounterClockwise)
export const Settings = make(GearSix, "duotone")
export const Sparkles = make(Sparkle, "fill")
export const Trash2 = make(Trash, "duotone")
export const X = make(PX)
