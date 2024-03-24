import { Card, CardBody, CardFooter, Divider } from "@nextui-org/react";
import { MyButton } from "../components/ui/MyButton";
import { useState } from "react";
import CollabBoard from "./CollabBoard";

function Collab() {
  const [startCollab, setStartCollab] = useState(false);

  return (
    <>
      {startCollab ? (
        <CollabBoard />
      ) : (
        <div className="flex h-[90vh] justify-center items-center">
          <Card className="max-w-[400px] min-h-[150px]">
            <CardBody>
              <div className="flex justify-between md:flex-col gap-2">
                <p>Start the Collaborative Session. Your work will be saved.</p>
              </div>
            </CardBody>
            <Divider />
            <CardFooter>
              <MyButton color="slate" onClick={() => setStartCollab(true)}>
                Start
              </MyButton>
            </CardFooter>
          </Card>
        </div>
      )}
    </>
  );
}

export default Collab;
