import SinglePageRenderer from "@/components/Page/SinglePageRenderer";

export const dynamic = 'force-dynamic';

export default function Page() {
  // 对应 Strapi 的 Single Type: DyslexiaAtAGlance
  // API 通常转为中划线小写: /dyslexia-at-a-glance
  return <SinglePageRenderer apiPath="/dyslexia-at-a-glance" />;
}