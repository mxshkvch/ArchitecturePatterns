import { Spinner } from "react-bootstrap";

type SpinnerProps = {
  theme: "LIGHT" | "DARK";
};

export const SpinnerComponent = ({ theme }: SpinnerProps) => (
  <div className="text-center my-5">
    <Spinner animation="border" variant={theme === "DARK" ? "light" : "dark"} />
  </div>
);