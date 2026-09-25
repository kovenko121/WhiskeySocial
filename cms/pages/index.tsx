import { NavigateToResource } from '@refinedev/nextjs-router';

const Home = () => <NavigateToResource resource="whiskey" />;

Home.noLayout = true;

export default Home;
