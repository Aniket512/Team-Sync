import { GoogleLogin } from "@react-oauth/google";
import { Card, CardBody, CardHeader } from "@nextui-org/react";

type SignInProps = {
  handleSuccess: (response: any) => void;
};

const SignInButton = ({ handleSuccess }: SignInProps) => {
  return (
    <div>
      <Card className="w-[300px] sm:w-[400px] border-solid border-2 border-gray-600">
        <CardHeader>
          <p className="text-lg ">Welcome to Team Sync 🔥!</p>
        </CardHeader>
        <CardBody>
          <GoogleLogin
            onSuccess={handleSuccess}
            onError={() => {
              console.log("Login Failed");
            }}
          />
        </CardBody>
      </Card>
    </div>
  );
};

export default SignInButton;
