interface Props {
  params: { cityName: string };
}

export default function CityPage({ params }: Props) {
  return (
    <main className="flex items-center justify-center h-screen bg-black text-white">
      <h1 className="text-3xl font-semibold">City: {params.cityName}</h1>
    </main>
  );
}
