import Loading from "@/components/common/loading/Loading";
import { render } from "@testing-library/react";

describe("Loading Component", () => {
  it("renders without crashing", () => {
    render(<Loading />);
  });
});
