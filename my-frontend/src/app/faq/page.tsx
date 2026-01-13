import SinglePageRenderer from "@/components/Page/SinglePageRenderer";

export default function FAQPage() {
  // 直接复用通用渲染器，去读 "faq" 这个单页的数据
  return <SinglePageRenderer apiPath="/faq" />;
}