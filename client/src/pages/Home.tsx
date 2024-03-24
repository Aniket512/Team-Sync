import { Image, Link } from "@nextui-org/react";
import { Wifi } from "lucide-react";
import { MyButton } from "../components/ui/MyButton";
import { ThemeSwitcher } from "../components/ui/ThemeSwitcher";
import { isUserLoggedIn } from "../configs/auth";
import dashboardImg from "../assets/dashboard.png";
import heroImg from "../assets/hero.jpeg";
import chatImg from "../assets/chat.png";
import collabImg from "../assets/collab.png";
import surveyImg from "../assets/survey.png";
import tasksImg from "../assets/tasks.png";

export default function Home() {
  const user = isUserLoggedIn();

  return (
    <div>
      <header className="border-b border-border">
        <nav className="max-w-6xl mx-auto container flex justify-between items-center py-4">
          <div>
            <Link href="/">
              <Image src="/logo.png" alt="app logo" width={120} />
            </Link>
            <ul>
              <li></li>
              <li></li>
              <li></li>
            </ul>
          </div>

          <div className="flex gap-2">
            {user ? (
              <MyButton as={Link} href="/projects" color="slate">
                Dashboard
              </MyButton>
            ) : (
              <MyButton as={Link} href="/login" color="slate">
                Sign In
              </MyButton>
            )}
            <ThemeSwitcher />
          </div>
        </nav>
      </header>
      <main>
        <div className="max-w-5xl mx-auto container">
          <div className="text-center py-10 flex flex-col items-center justify-center">
            <div className="my-6">
              <Image
                src={heroImg}
                alt="hero image"
                width={400}
                className="w-[500px]"
              />
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl md:text-5xl font-semibold tracking-tight">
                Unite, Communicate, and Collaborate in{" "}
                <span className="text-orange-600 font-bold">Real Time</span>
              </h1>
              <div className="text-xl md:text-3xl tracking-tighter text-secondary-foreground">
                Empower Your Community with Real-Time Social Interaction
              </div>
              <MyButton as={Link} href="/login" color="slate">
                Get Started
              </MyButton>
            </div>
          </div>
          <div className="mt-8 relative space-y-6">
            <div className="border-8 border-border rounded-md overflow-hidden ">
              <Image src={dashboardImg} alt="screenshot" className="w-full" />
            </div>
            <div>
              <h2 className="text-2xl md:text-4xl font-semibold tracking-tight text-center">
                Real Time Community Dashboards
              </h2>
              <p className="text-center text-muted-foreground mt-4 text-lg md:text-xl">
                View and manage community and members data live
              </p>

              <div className="mt-4 text-lg md:text-xl text-center tracking-tight">
                You can monitor your community data in real time. See how many
                members are online and know exacly who are!
              </div>
            </div>
          </div>

          <div className="flex justify-center mt-32">
            <Wifi className="w-32 h-32 text-orange-600" />
          </div>
          <div className="mt-32">
            <div>
              <h2 className="text-2xl md:text-4xl font-semibold tracking-tight text-center">
                Take Advantage of Other Live Features
              </h2>
              <p className="text-center text-muted-foreground mt-4 text-lg md:text-xl">
                Experience real time social interactions
              </p>
            </div>
            <div className="space-y-16 md:space-y-10 mt-16">
              <div>
                <div className="flex flex-col md:gap-8 md:flex-row">
                  <Image
                    src={chatImg}
                    className="border-4 border-border rounded-md overflow-hidden m-2"
                    alt="chat screenshot"
                  />
                  <div className="col-span-12 md:col-span-5 mt-4 md:mt-0">
                    <h3 className="tracking-tight text-xl md:text-2xl text-center md:text-left font-medium mb-2 md:mb-4">
                      Chat with community members in real time
                    </h3>
                    <p className="text-lg md:text-xl text-center md:text-left">
                      Communicate within your communities live. You will be able
                      to chat with your fellow community-mates in real time.
                      Send and respond to messages quickly.
                    </p>
                  </div>
                </div>
              </div>
              <div>
                <div className="flex flex-col md:gap-8 md:flex-row">
                  <div className="col-span-12 md:col-span-5 mt-4 md:mt-0 row-start-2 md:row-start-1">
                    <h3 className="tracking-tight text-xl md:text-2xl text-center md:text-left font-medium mb-2 md:mb-4">
                      Take surveys and get real time answers and results
                    </h3>
                    <p className="text-lg md:text-xl text-center md:text-left">
                      Need to gauge community opinions or take a vote? Visit
                      your community&apos;s survey tab. Create a survey,
                      establish choices, and watch your community answer in real
                      time.
                    </p>
                  </div>
                  <Image
                    src={surveyImg}
                    className="border-4 border-border rounded-md overflow-hidden m-2"
                    alt="chat screenshot"
                  />
                </div>
              </div>
              <div>
                <div className="flex flex-col md:gap-8 md:flex-row">
                  <Image
                    src={collabImg}
                    className="border-4 border-border rounded-md overflow-hidden m-2"
                    alt="chat screenshot"
                  />
                  <div className="col-span-12 md:col-span-5 mt-4 md:mt-0">
                    <h3 className="tracking-tight text-xl md:text-2xl text-center md:text-left font-medium mb-2 md:mb-4">
                      Collab using whiteboard
                    </h3>
                    <p className="text-lg md:text-xl text-center md:text-left">
                      Share and discuss creative ideas and solutions with your
                      team members using the in house integrated excalidraw
                      platform.
                    </p>
                  </div>
                </div>
              </div>
              <div>
                <div className="flex flex-col md:gap-8 md:flex-row">
                  <div className="col-span-12 md:col-span-5 mt-4 md:mt-0 row-start-2 md:row-start-1">
                    <h3 className="tracking-tight text-xl md:text-2xl text-center md:text-left font-medium mb-2 md:mb-4">
                      Create and assign tasks to the project members
                    </h3>
                    <p className="text-lg md:text-xl text-center md:text-left">
                      Need to manage tasks for your project or assign them to
                      team members? Visit your project's task management tab.
                      Create tasks, set deadlines, and track progress.
                    </p>
                  </div>
                  <Image
                    src={tasksImg}
                    className="border-4 border-border rounded-md overflow-hidden m-2"
                    alt="chat screenshot"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <footer className="bg-slate-900 text-white mt-24">
        <div className="container max-w-6xl py-4 mx-auto">
          <div className="text-[12px] md:text-sm text-center mt-2">
            Aniket Mishra · &copy;2023
          </div>
        </div>
      </footer>
    </div>
  );
}
