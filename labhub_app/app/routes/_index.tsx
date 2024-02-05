import { useLoaderData } from "@remix-run/react"
import { app } from "~/electron.server"
import Topbar from "~/components/Topbar"
import PanelContainer from "~/components/Panel/PanelContainer"
import SelectionBar from "~/components/selection/SelectionBar"

export function loader() {
  return {
    userDataPath: app.getPath("userData"),
  }
}

export default function Index() {
  const data = useLoaderData<typeof loader>()
  return (
    <div className="h-screen flex flex-col justify-between box-border bg-[#333333]">
        <Topbar />
        <div className="flex-grow">
          <PanelContainer />
        </div>
        <SelectionBar />
    </div>
  )
}
