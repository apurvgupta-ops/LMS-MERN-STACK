"use client";
import React, { FC, useState } from "react";
import { Metatags } from "./(utils)/Metatags";
import { Header } from "./(components)/Header";
import Hero from "./(components)/Hero";

interface HomeProps {}

const Home: FC<HomeProps> = ({}) => {
  const [activeItem, setActiveItem] = useState<number>(0);
  const [open, setOpen] = useState(false);
  return (
    <div>
      <Metatags
        title="ELearning"
        description="Elearning is a platform for students to learn and get help from teachers"
        keywords="Programming, MERN, Redux"
      />
      <Header open={open} setOpen={setOpen} activeItem={activeItem} />
      <Hero />
    </div>
  );
};

export default Home;
