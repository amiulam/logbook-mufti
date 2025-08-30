import { Card, CardContent } from "@/components/ui/card";
import SignInForm from "./_components/form";
import Image from "next/image";

export default function SignInPage() {
  return (
    <Card className="overflow-hidden p-0">
      <CardContent className="grid p-0 md:grid-cols-2">
        <SignInForm />
        <div className="bg-muted relative hidden md:block">
          <Image
            src="/placeholder.svg"
            width={1000}
            height={1000}
            alt="Image"
            className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
          />
        </div>
      </CardContent>
    </Card>
  );
}
