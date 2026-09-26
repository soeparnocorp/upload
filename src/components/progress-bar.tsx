export default function ProgressBar({ value }: { value: number }) {
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
      <div
        className="h-full bg-black transition-all duration-200"
        style={{ width: `${value}%` }}
      />
    </div>
  )
}
