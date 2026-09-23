import { Studio } from "sanity";
import config from "../../sanity.config";

export default function StudioRoot() {
  return <Studio config={config} />;
}
