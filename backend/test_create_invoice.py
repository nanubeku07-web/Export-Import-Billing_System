import json
import urllib.request
import urllib.error

BASE = 'http://127.0.0.1:8000'

def get_products():
    url = BASE + '/api/products/'
    req = urllib.request.Request(url)
    with urllib.request.urlopen(req, timeout=10) as resp:
        data = resp.read()
        return json.loads(data)

def post_invoice(product_id):
    url = BASE + '/api/invoices/'
    payload = {"create_items": [{"product": product_id, "quantity": 1, "price": "1.00"}]}
    body = json.dumps(payload).encode('utf-8')
    req = urllib.request.Request(url, data=body, headers={'Content-Type': 'application/json'}, method='POST')
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            data = resp.read()
            print('POST status:', resp.getcode())
            try:
                print('POST response JSON:', json.loads(data))
            except Exception:
                print('POST response text:', data.decode('utf-8'))
    except urllib.error.HTTPError as e:
        print('POST failed status:', e.code)
        try:
            print('Error body:', e.read().decode('utf-8'))
        except Exception:
            pass
    except Exception as e:
        print('POST exception:', str(e))

if __name__ == '__main__':
    try:
        prods = get_products()
        print('Got products count:', len(prods))
        if not prods:
            print('No products available to test')
        else:
            pid = prods[0]['id']
            print('Using product id:', pid)
            post_invoice(pid)
    except Exception as e:
        print('Exception during test:', str(e))
