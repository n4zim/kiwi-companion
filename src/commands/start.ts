import newCommand from "../core/newCommand"
import forever from "forever-monitor"

newCommand(this, {
  command: "start",
  description: "Start development mode (daemon)",
  handler: () => {
    console.log(forever.start("ping dropin.link"))
    console.log("test")
  },
})
