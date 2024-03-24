import { Image } from "@nextui-org/react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import SignInButton from "../components/ui/SignInButton";
import { setUserLoggedIn } from "../configs/auth";
import teamImg from "../assets/team.png";


export default function Login() {
  const navigate = useNavigate();
  const handleSuccess = (response: any) => {
    axios
      .post("http://localhost:5000/auth/login", response)
      .then((res) => {
        setUserLoggedIn(res?.data);
        navigate("/projects");
      })
      .catch((err) => {
        console.error(err);
        toast.error(err.message);
      });
  };

  return (
    <>
      <div className="container flex relative h-screen flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0">
        <div className="relative hidden h-full flex-col bg-muted p-10 text-white dark:border-r lg:flex">
          <div className="absolute inset-0 bg-orange-600" />
          <div className="relative z-20 flex items-center text-lg font-medium">
            {/* <Image src={team} alt="full logo" className="w-40" /> */}
          </div>
          <div className="relative z-20 mt-auto">
            <Image src={teamImg} alt="full logo" className="mx-auto mb-10" />
            <blockquote className="space-y-2">
              <p className="text-lg">
                &ldquo;You need to be aware of what others are doing, applaud
                their efforts, acknowledge their successes, and encourage them
                in their pursuits. When we all help one another, everybody
                wins.&rdquo;
              </p>
              <footer className="text-sm">Jim Stovall</footer>
            </blockquote>
          </div>
        </div>
        <div className="lg:p-8">
          <div className="mx-auto flex w-full flex-col justify-center items-center space-y-6 sm:w-[350px]">
            <Link to="/">
              <Image
                src={teamImg}
                alt="full logo"
                className="w-60 mx-auto lg:hidden"
              />
            </Link>
            <div className="flex flex-col space-y-2 justify-center items-center">
              <SignInButton handleSuccess={handleSuccess} />
              <p className="text-sm text-muted-foreground">
                Sign into your existing account.
              </p>
            </div>
            <p className="px-8 text-center text-sm text-muted-foreground">
              By clicking continue, you agree to our Terms of Service and
              Privacy Policy .
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
