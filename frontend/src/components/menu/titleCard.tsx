import React, { ReactElement, SVGProps } from "react";

interface TitleCardProps {
    Icon: ReactElement<SVGProps<SVGSVGElement>>;
    Title: string;
}

export default function TitleCard({ Icon, Title }: TitleCardProps) {
    const iconWithFill = React.cloneElement(Icon, { fill: "var(--color-main-500)" });
    return (
        <div className="flex items-center space-x-2 ">
            
                {iconWithFill}
           
            <h2 className="text-lg font-bold">{Title}</h2>
        </div>
    );
}
