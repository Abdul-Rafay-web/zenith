import type { TrackTemplate } from "../../types"
import { SHARPER_MIND_TRACK } from "./sharperMind"
import { TESTOSTERONE_RESTORE_TRACK, STRENGTH_ENERGY_TRACK } from "./testosteroneRestore"
import { ATTENTION_RESET_TRACK } from "./attentionReset"
import { SKIN_AND_HAIR_TRACK } from "./skinAndHair"
import { NEUROCHEMICAL_BALANCE_TRACK, NEUROCHEMICALS, type NeurochemicalInfo } from "./neurochemicalBalance"
import { SHARED_FOUNDATION_TASKS } from "./sharedFoundation"

export {
  SHARPER_MIND_TRACK,
  TESTOSTERONE_RESTORE_TRACK,
  STRENGTH_ENERGY_TRACK,
  ATTENTION_RESET_TRACK,
  SKIN_AND_HAIR_TRACK,
  NEUROCHEMICAL_BALANCE_TRACK,
  NEUROCHEMICALS,
  SHARED_FOUNDATION_TASKS,
  type NeurochemicalInfo,
}

export const ALL_TRACKS: TrackTemplate[] = [
  SHARPER_MIND_TRACK,
  TESTOSTERONE_RESTORE_TRACK,
  ATTENTION_RESET_TRACK,
  SKIN_AND_HAIR_TRACK,
  NEUROCHEMICAL_BALANCE_TRACK,
]

export function getTrackById(id: string, variant?: "male" | "strength-energy"): TrackTemplate | undefined {
  if (id === "track-testosterone-restore" && variant === "strength-energy") {
    return STRENGTH_ENERGY_TRACK
  }
  if (id === STRENGTH_ENERGY_TRACK.id) {
    return STRENGTH_ENERGY_TRACK
  }
  return ALL_TRACKS.find((track) => track.id === id)
}
