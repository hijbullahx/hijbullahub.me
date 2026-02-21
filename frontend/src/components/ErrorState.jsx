export default function ErrorState({ message = "Something went wrong." }) {
  return <p className="text-red-400">{message}</p>;
}
