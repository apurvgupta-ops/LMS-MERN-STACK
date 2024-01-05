import mongoose, { Model, Document, Schema } from "mongoose";

interface IFaq extends Document {
  question: string;
  answer: string;
}

interface ICategory extends Document {
  title: string;
}

interface IBanner extends Document {
  public_id: string;
  url: string;
}

interface ILayout extends Document {
  type: string;
  faq: IFaq[];
  categories: ICategory[];
  banner: {
    image: IBanner;
    title: string;
    subTitle: string;
  };
}

const faqSchema = new Schema<IFaq>({
  question: {
    type: String,
  },
  answer: {
    type: String,
  },
});

const categorySchema = new Schema<ICategory>({
  title: {
    type: String,
  },
});

const bannerSchema = new Schema<IBanner>({
  public_id: String,
  url: String,
});

const layoutSchema = new Schema<ILayout>({
  type: String,
  faq: [faqSchema],
  categories: [categorySchema],
  banner: {
    image: bannerSchema,
    title: String,
    subTitle: String,
  },
});

const LayoutModel: Model<ILayout> = mongoose.model("Layout", layoutSchema);

export default LayoutModel;
