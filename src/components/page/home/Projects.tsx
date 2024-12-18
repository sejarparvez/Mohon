import SectionHeader from "@/components/common/animation/SectionHeader";
import ProjectSlider from "./ProjectSlider";

export default function Projects() {
  return (
    <div
      className="flex flex-col items-center justify-center lg:gap-10"
      id="project"
    >
      <SectionHeader title="Our Student" />
      <ProjectSlider />
    </div>
  );
}
