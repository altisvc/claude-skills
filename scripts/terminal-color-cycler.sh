#!/usr/bin/env zsh
# Terminal Color Cycler — gives every new Terminal.app tab a distinct background
#
# Picks a pastel that no other open Terminal tab is currently using, so each
# window is visually distinct at a glance. Pastels listed first → preferred;
# darks are reserved as fallback when every pastel is taken. Round-robin kicks
# in only if every palette color is in use.
#
# Install: copy this file to ~/.claude/scripts/terminal-color-cycler.sh and add
# this line to ~/.zshrc:
#
#   [ -f ~/.claude/scripts/terminal-color-cycler.sh ] && source ~/.claude/scripts/terminal-color-cycler.sh
#
# Behavior:
#   - Runs once per interactive shell startup (env guard)
#   - Skips silently for non-interactive shells, non-Apple_Terminal, or non-macOS
#   - Targets THIS tab via tty matching (not "front window" which races on rapid opens)
#   - Sets background + text via Terminal.app properties (persists past Claude/ANSI resets)

# Pre-conditions — bail out quietly if any fail
[[ -o interactive ]] || return 0
[[ "$TERM_PROGRAM" == "Apple_Terminal" ]] || return 0
command -v osascript >/dev/null 2>&1 || return 0
[[ -n "$TERMINAL_COLOR_CYCLED" ]] && return 0
export TERMINAL_COLOR_CYCLED=1

__terminal_color_cycle() {
  # Palette format: "BG_R BG_G BG_B   FG_R FG_G FG_B"
  # BG components are 0-255 (multiplied by 257 for 16-bit AppleScript later)
  # FG components are already 16-bit (3276 = light text, 62965 = dark text)
  local BG_COLORS=(
    # Pastels (preferred)
    "200 215 235   3276 3276 3276"      # Sky blue
    "235 215 195   3276 3276 3276"      # Peach
    "210 200 230   3276 3276 3276"      # Lilac
    "195 230 210   3276 3276 3276"      # Seafoam
    "240 225 195   3276 3276 3276"      # Buttercream
    "225 200 215   3276 3276 3276"      # Rose
    "215 230 200   3276 3276 3276"      # Mint
    "230 210 235   3276 3276 3276"      # Lavender
    "245 220 210   3276 3276 3276"      # Apricot
    "200 225 230   3276 3276 3276"      # Powder blue
    "225 215 195   3276 3276 3276"      # Sand
    "215 225 240   3276 3276 3276"      # Periwinkle
    "230 235 200   3276 3276 3276"      # Honeydew
    "240 215 220   3276 3276 3276"      # Blush
    "210 235 225   3276 3276 3276"      # Spearmint
    "220 220 240   3276 3276 3276"      # Wisteria
    # Darks (only used if every pastel is taken)
    "3 15 31       62965 62965 62965"   # Navy
    "40 15 50      62965 62965 62965"   # Purple
    "5 40 35       62965 62965 62965"   # Teal
    "15 15 40      62965 62965 62965"   # Deep indigo
  )

  local MY_TTY=$(tty)
  # Query background colors of all OTHER open Terminal tabs (16-bit triples, one per line)
  local USED_COLORS=$(osascript <<APPLESCRIPT 2>/dev/null
tell application "Terminal"
  set out to ""
  repeat with w in windows
    repeat with t in tabs of w
      try
        if tty of t is not "$MY_TTY" then
          set bg to background color of t
          set out to out & (item 1 of bg as integer) & " " & (item 2 of bg as integer) & " " & (item 3 of bg as integer) & linefeed
        end if
      end try
    end repeat
  end repeat
  return out
end tell
APPLESCRIPT
)

  # Pick the first palette entry whose color is not within tolerance of any open tab
  # Tolerance ~500/65535 (~8-bit) absorbs minor AppleScript rounding
  local BG_PICK=""
  local BG_ENTRY BG_R BG_G BG_B FG_R FG_G FG_B R16 G16 B16 IN_USE UR UG UB DR DG DB
  for BG_ENTRY in "${BG_COLORS[@]}"; do
    read -r BG_R BG_G BG_B FG_R FG_G FG_B <<< "$BG_ENTRY"
    R16=$((BG_R * 257)); G16=$((BG_G * 257)); B16=$((BG_B * 257))
    IN_USE=0
    while IFS=' ' read -r UR UG UB; do
      [ -z "$UR" ] && continue
      DR=$(( UR > R16 ? UR - R16 : R16 - UR ))
      DG=$(( UG > G16 ? UG - G16 : G16 - UG ))
      DB=$(( UB > B16 ? UB - B16 : B16 - UB ))
      if [ $DR -lt 500 ] && [ $DG -lt 500 ] && [ $DB -lt 500 ]; then
        IN_USE=1; break
      fi
    done <<< "$USED_COLORS"
    if [ $IN_USE -eq 0 ]; then
      BG_PICK="$BG_ENTRY"
      break
    fi
  done

  # Fall back to round-robin if every color is in use
  if [ -z "$BG_PICK" ]; then
    local BG_INDEX_FILE="$HOME/.terminal_bg_index"
    local BG_IDX=$(cat "$BG_INDEX_FILE" 2>/dev/null || echo 0)
    echo $(( (BG_IDX + 1) % ${#BG_COLORS[@]} )) > "$BG_INDEX_FILE"
    BG_PICK="${BG_COLORS[$((BG_IDX + 1))]}"
  fi

  read -r BG_R BG_G BG_B FG_R FG_G FG_B <<< "$BG_PICK"
  osascript <<APPLESCRIPT &
    tell application "Terminal"
      repeat with w in windows
        repeat with t in tabs of w
          if tty of t is "$MY_TTY" then
            set background color of t to {$((BG_R * 257)), $((BG_G * 257)), $((BG_B * 257)), 65535}
            set normal text color of t to {$FG_R, $FG_G, $FG_B, 65535}
            set bold text color of t to {$FG_R, $FG_G, $FG_B, 65535}
            return
          end if
        end repeat
      end repeat
    end tell
APPLESCRIPT
}

__terminal_color_cycle
unfunction __terminal_color_cycle
