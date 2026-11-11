# Power with charge limit

A clone of [Omarchy](https://github.com/omacom/omarchy)'s power panel that adds a `Limit 80 | 100` charge limit switch next to the "Battery" title and a marker at 80% on the progress bar. Neither adds any height to the panel, and the switch has a fixed width, so nothing moves when you use it.

Changes go through UPower's `EnableChargeThreshold`, so the switch itself needs no root helper, sudoers rule or password prompt from the active session.

The panel also says why a battery isn't charging: "Above limit, not charging", "Too hot to charge" (the SMC's own heat pause, or the optional heat guard below), or "Charging paused". It checks the kernel's battery status as well as UPower's, because UPower's copy goes stale when upower restarts.

**Hardware:** built and tested on one MacBook Air (M1, 2020) running Asahi. The battery name is hardcoded to `macsmc-battery`, so it won't work on other machines without changes. On hardware where the limit can't be read, the switch and marker stay hidden.

## Install

```bash
git clone https://github.com/WilliamJohnDavisIII/omarchy-power-charge-limit ~/.config/omarchy/plugins/david.power
```

In `~/.config/omarchy/shell.json`, change the bar entry `"id": "omarchy.power"` to `"id": "david.power"`, then run `omarchy restart shell`. Editing the panel also needs a shell restart, because hot reload doesn't rebuild this widget.

### Optional: heat guard

`heat-guard/battery-heat-guard` is a small root service. It pauses charging while the battery is at 40°C or hotter and resumes at 37°C. The firmware has no "stop charging" switch, so a pause lowers the limit to the current level and the resume puts it back. It never pauses below 20%, and the panel shows "Too hot to charge" during a pause.

It also repairs a broken limit. If the limit ends up under 50% and the guard didn't set it, the guard puts back the last real one (80 or 100) within about 15 seconds. It also keeps Asahi's saved copy for reboots in sync.

```bash
cd ~/.config/omarchy/plugins/david.power/heat-guard
sudo ./battery-heat-guard selftest   # checks the firmware accepts limits other than 80/100
sudo install -m755 battery-heat-guard /usr/local/bin/
sudo install -m644 battery-heat-guard.service /etc/systemd/system/
sudo systemctl enable --now battery-heat-guard
journalctl -u battery-heat-guard     # one line per pause, resume or repair
```

The thresholds can be changed with `PAUSE_AT`, `RESUME_AT` (tenths of a degree), `MIN_LEVEL` and `SANE_MIN` set as environment variables in a service override.

This is a fork of the panel, so it won't pick up upstream changes to it. Native support is being discussed in [omacom/omarchy#10431](https://github.com/omacom/omarchy/discussions/10431).

## Keyboard

Up moves from the profiles to the switch, Left and Right pick a value, Enter applies it, and Down goes back.

## What I found on this Mac

Measured on Asahi with UPower 1.91.5:

- `EnableChargeThreshold true` sets sysfs to end 80, start 75. `false` sets end 100, start 100. No password was needed.
- UPower's `ChargeEndThreshold` and `ChargeStartThreshold` stay at 80 and 75 even with the limit off or changed directly in sysfs, and `omarchy-battery-status` trusts them. So this panel reads the limit from sysfs and works out time to full itself.
- `ChargeThresholdEnabled` can read `false` while the hardware is limiting at 80, if something other than UPower set the limit.
- Reloading the `macsmc_power` driver (`rmmod`/`modprobe`) makes the limit file vanish for a moment. UPower then re-applies its thresholds with junk values, the driver clamps them to its 10% floor, and the Mac holds at 10%. Asahi's path unit also saves an empty value, so the limit isn't restored at boot either. Restarting UPower afterwards is needed too, or it keeps the junk and writes it back the next time the switch is used. The heat guard repairs all of this on its own.
- Asahi's `macsmc-battery-charge-control-end-threshold` path unit saves the limit for reboots, but it stops saving after 5 changes in 10 seconds. The switch follows each click at once but only applies your final choice after about 2 seconds without a click, which stays under that.

## Not yet verified

- Which limit wins after a reboot if UPower's saved state and Asahi's saved value differ
- The panel's own "time to full" count while actually charging

## Tests

```bash
node tests/model.test.js
```

## License

MIT, same as Omarchy. See `LICENSE`.
