import Button from "./button.ui";

export default function NavBar() {
  return (
    <div className=" absolute top-0 z-500 flex justify-between w-full items-center gap-3 px-20 py-3 bg-transparent">
      <div>NAMMA DHARANI</div>
      <div>
        <Button />
      </div>
    </div>
  );
}
