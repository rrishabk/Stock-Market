import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface Props {
  title?: string;
  message?: string;
}

export default function ErrorState({ title = "Something went wrong", message = "Please try again." }: Props) {
  return (
    <Alert variant="destructive" role="alert" aria-live="assertive">
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  );
}
