export default function LoadingScreen() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-6">
      <div className="animate-[pulse_1.8s_ease-in-out_infinite] text-[clamp(1.8rem,6vw,2.5rem)] font-extrabold tracking-[-0.5px]">
        <span className="text-lin-orange">Lin</span>
        <span className="text-choy-green">Choy</span>
      </div>
      <div className="h-9 w-9 animate-[spin_0.9s_linear_infinite] rounded-full border-[3px] border-border border-t-lin-orange border-r-choy-green" />
    </div>
  );
}
