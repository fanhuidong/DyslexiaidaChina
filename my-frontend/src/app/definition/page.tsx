import SinglePageRenderer from "@/components/Page/SinglePageRenderer";

export default function Page() {
  // 对应 Strapi 的 Single Type: Definition
  return <SinglePageRenderer apiPath="/definition" />;
}