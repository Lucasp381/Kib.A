import { Card, CardTitle,  CardContent } from "@/components/ui/card";

type Props = {
  error: string[] ;
};

export default function Custom503({ error }: Props) {


    return (
        <Card className=" w-screen p-5 border-0 shadow-none">
            <CardContent className="flex flex-col items-center justify-center ">
                <img src="503-ServiceUnavailable.png" className="rounded-lg h-96  mask-x-from-85% opacity-70"  />
                <div className="m-4">
                    <strong>The service is currently unavailable.</strong>
                    <p>Please check Elasticsearch and Kibana status.</p>
                </div>
                {error && error.length > 0 && (
                    <div>
                        <div className="m-4">
                            <strong>Error Details:</strong>
                        </div>
                        <div className="m-4">
                            {error.map((err, index) => (
                                <p key={index}>{err}</p>
                            ))}
                        </div>
                    </div>
                )}
               
            </CardContent>
        </Card>
    )



}