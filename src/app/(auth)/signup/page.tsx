import { Card, CardContent } from "@/components/ui/card";
import SignUpForm from "./_components/form";
import Image from "next/image";

export default function SignUpPage() {
  return (
    <Card className="overflow-hidden p-0">
      <CardContent className="grid p-0 md:grid-cols-2">
        <SignUpForm />
        <div className="bg-muted relative hidden border-l md:block">
          <Image
            src="/images/app-illustration.jpg"
            width={1000}
            height={1000}
            alt="Image"
            className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.8]"
          />
        </div>
      </CardContent>
    </Card>
  );
}
