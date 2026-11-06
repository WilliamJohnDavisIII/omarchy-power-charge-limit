# Power with charge limit

A clone of [Omarchy](https://github.com/omacom/omarchy)'s power panel that adds an `80 | 100` charge limit switch next to the "Battery" title and a marker at 80% on the progress bar. Neither adds any height to the panel, and the switch has a fixed width, so nothing moves when you use it.

Changes go through UPower's `EnableChargeThreshold`, so there's no root helper, sudoers rule or password prompt from the active session.

**Hardware:** built and tested on one MacBook Air (M1, 2020) running Asahi. The battery name is hardcoded to `macsmc-battery`, so it won't work on other machines without changes. On hardware where the limit can't be read, the switch and marker stay hidden.

## Install

```bash
git clone https://github.com/WilliamJohnDavisIII/omarchy-power-charge-limit ~/.config/omarchy/plugins/david.power
```

In `~/.config/omarchy/shell.json`, change the bar entry `"id": "omarchy.power"` to `"id": "david.power"`, then run `omarchy restart shell`. Editing the panel also needs a shell restart, because hot reload doesn't rebuild this widget.

This is a fork of the panel, so it won't pick up upstream changes to it. Native support is being discussed in [omacom/omarchy#10431](https://github.com/omacom/omarchy/discussions/10431).

## Keyboard

Up moves from the profiles to the switch, Left and Right pick a value, Enter applies it, and Down goes back.

## What I found on this Mac

Measured on Asahi with UPower 1.91.5:

- `EnableChargeThreshold true` sets sysfs to end 80, start 75. `false` sets end 100, start 100. No password was needed.
- UPower's `ChargeEndThreshold` and `ChargeStartThreshold` stay at 80 and 75 even with the limit off or changed directly in sysfs, and `omarchy-battery-status` trusts them. So this panel reads the limit from sysfs and works out time to full itself.
- `ChargeThresholdEnabled` can read `false` while the hardware is limiting at 80, if something other than UPower set the limit.
- Asahi's `macsmc-battery-charge-control-end-threshold` path unit saves the limit for reboots, but it stops saving after 5 changes in 10 seconds. The switch ignores changes less than 2.5 seconds apart to stay under that.

## Not yet verified

- Which limit wins after a reboot if UPower's saved state and Asahi's saved value differ
- "Time to full" while actually charging, and the "Above limit, not charging" message

## Tests

```bash
node tests/model.test.js
```

## License

MIT, same as Omarchy. See `LICENSE`.
