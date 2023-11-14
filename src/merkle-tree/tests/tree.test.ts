import { assert, use } from 'chai';
import fetchMock from 'fetch-mock';
import chaiFetchMock from 'chai-fetch-mock';
import { MerkleTreeService } from '../service';

use(chaiFetchMock)

describe('Merkletree tests', function test () {
  this.timeout(120000);

  this.beforeAll(() => {
    fetchMock.get('https://bpsd19dro1.execute-api.us-east-2.amazonaws.com/commitments', {
      data: ['4613618889813288715894130243957282271546550742261259215341954248817589349732'],
      is_last_page: true
    },
    { overwriteRoutes: true })
  })

  it('The code must create a new merkletree and validate root', async () => {
    const service = new MerkleTreeService({
      chainId: 0,
      dbUrl: 'https://bpsd19dro1.execute-api.us-east-2.amazonaws.com/commitments',
      instanceName: 'commitments-tree'
    })

    const tree = await service.getTree()

    assert(tree.root.toString(), '17901393628957442429944806687324002758544541901874515769142391264651376612606n')
  });
});
