const getData = async () => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve("hello world");
    }, 3000);
  });
};

export default async function Book() {
  const data = await getData();
  return (
    <>
      <h1>啊啦啦啦啦啦啦</h1>
    </>
  );
}
