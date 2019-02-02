import Layout from '../components/Layout'
import fetch from 'isomorphic-unfetch'

const Index = (props) => (
  <Layout>
    <p>Index page</p>
    <div>{props.time}</div>
  </Layout>
)

Index.getInitialProps = async function() {
  const res = await fetch('http://localhost:3000/now')
  const data = await res.json()
  console.log(data)
  return {
    time: data.timeInMs
  }
}

export default Index