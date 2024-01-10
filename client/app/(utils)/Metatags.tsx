import React, { FC } from "react";

interface MetatagsProps {
  title: string;
  description: string;
  keywords: string;
}

export const Metatags: FC<MetatagsProps> = ({
  title,
  description,
  keywords,
}) => {
  return (
    <>
      <title>{title}</title>
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
    </>
  );
};
